import React, { useState } from 'react';
import './Home.css';
import Modal from '../../components/Modal/Modal';
import ContributionForm from '../../components/ContributionForm/ContributionForm';
import AuthModal from '../../components/AuthModal/AuthModal';
// Popup replaced by Modal

const Home: React.FC = () => {
  const [open, setOpen] = useState(false)
  const [authOpen, setAuthOpen] = useState(false)
  const [learnOpen, setLearnOpen] = useState(false)

  return (
    <main className="landing-root">
      <div className="landing-top">
          <div className="landing-logo" aria-hidden>
            <span className="contrib-logo">Faitherpa</span>
          </div>
        <div className="site-tag">Supporting my vision and show me love</div>
      </div>

      <div className="landing-main">
        <section className="landing-hero">
          <h1 className="hero-title"><span className="plea">Please help me</span> by supporting this cause</h1>
          <p className="lead">
            Join other supporters by contributing today. You may choose to remain
            anonymous — names are stored but displayed only when allowed. Contributions
            are confirmed by an administrator before contributor-only access is granted.
          </p>

          <div className="hero-actions">
            <button className="btn btn--primary btn--large" onClick={() => setOpen(true)}>Make Contribution</button>
            <button className="btn btn--secondary" onClick={() => setAuthOpen(true)}>View Contributions</button>
            <button className="btn btn--outline" onClick={() => setLearnOpen(true)}>Learn More</button>
          </div>
        </section>
      </div>
      <Modal isOpen={open} onClose={() => setOpen(false)} title="Make a Contribution" className="rp-modal--form">
        <ContributionForm onClose={() => setOpen(false)} />
      </Modal>
      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
      <Modal isOpen={learnOpen} onClose={() => setLearnOpen(false)} title="About this campaign">
        <div>
          <p>
            I am a final-year student facing urgent financial difficulty covering my tuition and fees. Completing my degree is essential — I have received a conditional graduate offer from Barclays that depends on graduation. Without support to bridge this gap, I risk being unable to take up this career-making opportunity.
          </p>

          <p>
            Any contribution, large or small, will directly support my ability to graduate and honour the offer I have worked hard to secure. Your support has an immediate, measurable impact on my future career and financial stability.
          </p>

          <h4>Profile</h4>
          <p>
            <strong>Name:</strong> [Your name here] <br />
            <strong>Course:</strong> Final-year student in [Your course / department] <br />
            <strong>Highlights:</strong> Recipient of academic awards and internships; passionate about fintech, mentoring, and community projects.
          </p>

          <p>
            Please replace the placeholders above with your real details to personalise this message before sharing. If you’d like, you can also provide a short photo or link to your profile.
          </p>

          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
            <button className="btn btn--outline" onClick={() => setLearnOpen(false)}>Close</button>
            <button className="btn btn--primary" onClick={() => { setLearnOpen(false); setOpen(true); }}>Contribute</button>
          </div>
        </div>
      </Modal>
    </main>
  );
};

export default Home;

