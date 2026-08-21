// src/services/scannerService.js

// Mock function to simulate the OSINT & Cryptographic scan
export const scanEndpoint = async (url) => {
    return new Promise((resolve) => {
        // Simulate a delay for the deep scan
        setTimeout(() => {
            const results = {
                target_url: url,
                scan_timestamp: new Date().toISOString(),
                osint: {
                    registrar: "MarkMonitor Inc.",
                    creation_date: "1997-09-15T04:00:00Z",
                    expiration_date: "2028-09-14T04:00:00Z",
                    owner_organization: "Google LLC"
                },
                crypto: {
                    encryption_detected: "Elliptic Curve (ECC)",
                    is_quantum_safe: False,
                    vulnerabilities_found: [
                        "Vulnerable to Shor's Algorithm (Classical ECC detected)"
                    ],
                    mission_xp_awarded: 25
                }
            };
            
            // Add arbitrary XP to user score for the demo
            const storedScores = JSON.parse(localStorage.getItem("qcapsScores")) || {};
            storedScores['practical_security'] = (storedScores['practical_security'] || 0) + 25;
            
            const totalTopics = Object.keys(storedScores).length || 1;
            const overall = Math.round(Object.values(storedScores).reduce((a, b) => a + b, 0) / totalTopics);
            
            localStorage.setItem("qcapsScores", JSON.stringify(storedScores));
            localStorage.setItem("qcapsOverallScore", overall);

            resolve(results);
        }, 2000);
    });
};

