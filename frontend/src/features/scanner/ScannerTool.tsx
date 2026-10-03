import React, { useCallback, useEffect, useRef, useState } from 'react';
import { downloadScannerReport, fetchScanLog, fetchScanLogs } from '../../services/backendService';
import { checkDomainVerification, exportable, runScan, saveScan, ScannerApiError } from './scannerService';
import type { SaveOutcome, ScanLogSummary, ScanMode, ScanResultV2, VerificationInfo } from './types';
import { ChecksPanel } from './components/ChecksPanel';
import { DetailSections } from './components/DetailSections';
import { DomainVerificationPanel } from './components/DomainVerificationPanel';
import { FindingsList } from './components/FindingsList';
import { PqcPosturePanel } from './components/PqcPosturePanel';
import { ScanForm } from './components/ScanForm';
import { ScanHistory } from './components/ScanHistory';
import { ScanProgress } from './components/ScanProgress';
import { ScanSummary } from './components/ScanSummary';

type Phase = 'idle' | 'scanning' | 'result';

const isAbort = (e: unknown) => e instanceof DOMException && e.name === 'AbortError';
const messageOf = (e: unknown, fallback: string) => (e instanceof Error && e.message ? e.message : fallback);

const ScannerTool: React.FC = () => {
  const [target, setTarget] = useState('');
  const [mode, setMode] = useState<ScanMode>('standard');
  const [phase, setPhase] = useState<Phase>('idle');
  const [scanning, setScanning] = useState<{ target: string; mode: ScanMode } | null>(null);
  const [result, setResult] = useState<ScanResultV2 | null>(null);
  const [saved, setSaved] = useState<SaveOutcome | null>(null);
  const [logId, setLogId] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [history, setHistory] = useState<ScanLogSummary[] | null>(null);
  const [historyError, setHistoryError] = useState('');
  const [opening, setOpening] = useState(false);
  const [verification, setVerification] = useState<{ forTarget: string; info: VerificationInfo } | null>(null);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verifyError, setVerifyError] = useState('');
  const [reportBusy, setReportBusy] = useState(false);
  const [reportError, setReportError] = useState('');
  const abortRef = useRef<AbortController | null>(null);

  const loadHistory = useCallback(() => {
    fetchScanLogs()
      .then((rows) => {
        setHistory(rows);
        setHistoryError('');
      })
      .catch(() => setHistoryError('Your scan history could not be loaded.'));
  }, []);

  useEffect(() => {
    loadHistory();
    return () => abortRef.current?.abort();
  }, [loadHistory]);

  const trimmed = target.trim();
  const activeVerification = verification && verification.forTarget === trimmed ? verification.info : null;
  const canRun = mode === 'standard' || activeVerification?.verified === true;

  const handleScan = async (nextTarget?: string, nextMode?: ScanMode) => {
    const t = (nextTarget ?? target).trim();
    const m = nextMode ?? mode;
    if (!t) return;
    setTarget(t);
    setMode(m);
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setScanning({ target: t, mode: m });
    setPhase('scanning');
    setError('');
    setResult(null);
    setSaved(null);
    setLogId(null);
    setReportError('');
    try {
      const scanResult = await runScan(t, m, controller.signal);
      const outcome = await saveScan(scanResult);
      loadHistory();
      if (controller.signal.aborted) {
        setPhase('idle');
        return;
      }
      setResult(scanResult);
      setSaved(outcome);
      setLogId(outcome.ok ? outcome.logId : null);
      setPhase('result');
    } catch (e) {
      if (isAbort(e)) {
        setPhase('idle');
        return;
      }
      if (e instanceof ScannerApiError && e.verification) setVerification({ forTarget: t, info: e.verification });
      setError(messageOf(e, 'The scan failed.'));
      setPhase('idle');
    }
  };

  const handleVerify = async () => {
    if (!trimmed) {
      setVerifyError('Enter the domain first.');
      return;
    }
    setVerifyLoading(true);
    setVerifyError('');
    try {
      setVerification({ forTarget: trimmed, info: await checkDomainVerification(trimmed) });
    } catch (e) {
      setVerifyError(messageOf(e, 'Domain verification could not be checked.'));
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleOpen = async (id: number) => {
    setOpening(true);
    setError('');
    try {
      const record = await fetchScanLog(id);
      const parsed = JSON.parse(record.details ?? 'null');
      if (!parsed || parsed.schema_version !== 2) {
        setError('That scan was recorded by an earlier scanner version and cannot be displayed. Re-scan the domain to get a current result.');
        return;
      }
      setResult(parsed as ScanResultV2);
      setSaved(null);
      setLogId(id);
      setReportError('');
      setPhase('result');
    } catch {
      setError('That scan could not be opened.');
    } finally {
      setOpening(false);
    }
  };

  const handleReport = async () => {
    if (logId === null) return;
    setReportBusy(true);
    setReportError('');
    try {
      await downloadScannerReport(logId);
    } catch (e) {
      setReportError(messageOf(e, 'The report could not be downloaded.'));
    } finally {
      setReportBusy(false);
    }
  };

  const handleExport = () => {
    if (!result) return;
    const blob = new Blob([JSON.stringify(exportable(result), null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `qcaps-scan-${result.target_url}-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const handleNew = () => {
    setPhase('idle');
    setResult(null);
    setSaved(null);
    setLogId(null);
    setTarget('');
    setError('');
  };

  const incompleteChecks = result ? Object.values(result.checks).filter((c) => c.status !== 'ok').length : 0;

  return (
    <div className="sc-page">
      <header className="sc-head">
        <h1 className="sc-title">Crypto Scanner</h1>
        <p className="sc-lead">
          Assess the TLS, certificate, HTTP and DNS posture of a domain you are authorised to test, with a focus on post-quantum
          readiness. Every value comes from a live observation; a check that cannot run is reported as such, never filled in.
        </p>
      </header>

      {phase === 'idle' && (
        <>
          <ScanForm
            target={target}
            mode={mode}
            canRun={canRun}
            disabled={opening}
            onTargetChange={setTarget}
            onModeChange={setMode}
            onSubmit={() => handleScan()}
          />
          {error && <div className="sc-banner sc-banner--error" role="alert">{error}</div>}
          {mode === 'full' && (
            <DomainVerificationPanel info={activeVerification} loading={verifyLoading} error={verifyError} onCheck={handleVerify} />
          )}
          <ScanHistory
            history={history}
            error={historyError}
            busy={opening}
            onOpen={handleOpen}
            onRescan={(t, m) => handleScan(t, m)}
          />
        </>
      )}

      {phase === 'scanning' && scanning && (
        <ScanProgress target={scanning.target} mode={scanning.mode} onCancel={() => abortRef.current?.abort()} />
      )}

      {phase === 'result' && result && (
        <>
          <ScanSummary
            result={result}
            saved={saved}
            canReport={logId !== null}
            reportBusy={reportBusy}
            reportError={reportError}
            onReport={handleReport}
            onExport={handleExport}
            onRescan={() => handleScan(result.target_url, result.authorization.mode)}
            onNew={handleNew}
          />
          <PqcPosturePanel result={result} />
          <FindingsList findings={result.findings} incompleteChecks={incompleteChecks} />
          <DetailSections result={result} />
          <ChecksPanel checks={result.checks} />
        </>
      )}
    </div>
  );
};

export default ScannerTool;
