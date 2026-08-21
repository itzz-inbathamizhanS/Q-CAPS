// src/services/scannerService.js

// Function to call the Python OSINT & Cryptographic scanner API
export const scanEndpoint = async (url) => {
    try {
        const response = await fetch('http://127.0.0.1:5000/api/scan', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ url: url })
        });
        
        if (!response.ok) {
            throw new Error(`API Error: ${response.statusText}`);
        }
        
        const results = await response.json();
        
        // Add XP to user score if the scan was successful
        if (results && results.crypto && results.crypto.mission_xp_awarded) {
            const storedScores = JSON.parse(localStorage.getItem("qcapsScores")) || {};
            storedScores['practical_security'] = (storedScores['practical_security'] || 0) + results.crypto.mission_xp_awarded;
            
            const totalTopics = Object.keys(storedScores).length || 1;
            const overall = Math.round(Object.values(storedScores).reduce((a, b) => a + b, 0) / totalTopics);
            
            localStorage.setItem("qcapsScores", JSON.stringify(storedScores));
            localStorage.setItem("qcapsOverallScore", overall);
        }

        return results;
    } catch (error) {
        console.error("Failed to connect to Python Scanner API:", error);
        throw error;
    }
};

