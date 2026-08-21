// src/pages/AssessmentPage.js
import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SkillAssessmentForm from '../components/SkillAssessmentForm';

const AssessmentPage = () => {
    return (
        <div>
            <Header />
            <main className="container mx-auto p-4">
                <h1 className="text-2xl font-bold mb-4">Diagnostic Knowledge Assessment</h1>
                <SkillAssessmentForm />
            </main>
            <Footer />
        </div>
    );
};

export default AssessmentPage;