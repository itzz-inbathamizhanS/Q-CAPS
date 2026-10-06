"""Leaderboard WebSocket: the token arrives as the first message, never in the URL."""
import json
import time

import pytest
from starlette.websockets import WebSocketDisconnect

import main


def token_for(headers):
    return headers["Authorization"].split(" ", 1)[1]


def wait_for(condition, timeout=1.0):
    """The server task runs concurrently with the test client; poll briefly for its side effect."""
    deadline = time.monotonic() + timeout
    while time.monotonic() < deadline:
        if condition():
            return True
        time.sleep(0.01)
    return condition()


def test_valid_first_message_authenticates_and_registers(client, learner):
    _, h = learner
    before = len(main.manager.active_connections)
    with client.websocket_connect("/api/ws/leaderboard") as ws:
        ws.send_text(json.dumps({"type": "auth", "token": token_for(h)}))
        assert wait_for(lambda: len(main.manager.active_connections) == before + 1)
    assert wait_for(lambda: len(main.manager.active_connections) == before)  # disconnect unregisters it


@pytest.mark.parametrize("message", [
    {"type": "auth", "token": "not-a-jwt"},
    {"type": "hello", "token": None},
    "plain text",
])
def test_invalid_first_message_closes_with_4401(client, message):
    with client.websocket_connect("/api/ws/leaderboard") as ws:
        ws.send_text(message if isinstance(message, str) else json.dumps(message))
        with pytest.raises(WebSocketDisconnect) as exc:
            ws.receive_text()
    assert exc.value.code == 4401


def test_no_first_message_times_out_with_4401(client, monkeypatch):
    monkeypatch.setattr(main, "WS_AUTH_TIMEOUT_SECONDS", 0.2)
    with client.websocket_connect("/api/ws/leaderboard") as ws:
        with pytest.raises(WebSocketDisconnect) as exc:
            ws.receive_text()
    assert exc.value.code == 4401


def test_a_token_in_the_url_is_not_accepted(client, learner, monkeypatch):
    _, h = learner
    monkeypatch.setattr(main, "WS_AUTH_TIMEOUT_SECONDS", 0.2)
    with client.websocket_connect(f"/api/ws/leaderboard?token={token_for(h)}") as ws:
        with pytest.raises(WebSocketDisconnect) as exc:
            ws.receive_text()
    assert exc.value.code == 4401
