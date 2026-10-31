
import { Link } from "wouter";
import TermsOfService from "@/components/TermsOfService";

export default function Home() {
  return (
    <div className="ih-static-home">
      <style>{`
        .ih-static-home {
          min-height: 100vh;
          background: #172c22;
          color: #f3eddf;
          font-family: inherit;
        }

        .ih-static-home * {
          box-sizing: border-box;
        }

        .ih-static-home a {
          color: inherit;
        }

        .ih-static-container {
          width: min(1100px, calc(100% - 40px));
          margin: 0 auto;
        }

        .ih-static-header {
          padding: 22px 0;
          border-bottom: 1px solid rgba(243,237,223,.15);
        }

        .ih-static-header-inner {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          flex-wrap: wrap;
        }

        .ih-static-brand {
          display: flex;
          align-items: center;
          gap: 12px;
          text-decoration: none;
          font-weight: 800;
          letter-spacing: 2px;
        }

        .ih-static-brand img {
          width: 42px;
          height: 42px;
          object-fit: contain;
        }

        .ih-static-nav {
          display: flex;
          align-items: center;
          gap: 22px;
          flex-wrap: wrap;
        }

        .ih-static-nav a {
          text-decoration: none;
          font-size: 14px;
        }

        .ih-static-nav a:hover,
        .ih-static-footer a:hover {
          color: #c6d99a;
        }

        .ih-static-hero {
          padding: 105px 0 95px;
          background:
            radial-gradient(ellipse at 80% 20%, rgba(119,145,91,.19), transparent 45%),
            linear-gradient(135deg, #1d392b, #172c22);
        }

        .ih-static-eyebrow {
          color: #c6d99a;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 3px;
          text-transform: uppercase;
        }

        .ih-static-hero h1 {
          max-width: 760px;
          margin: 18px 0;
          font-size: clamp(42px, 7vw, 76px);
          line-height: 1.05;
          letter-spacing: -2px;
        }

        .ih-static-hero p {
          max-width: 600px;
          color: #d5d8c9;
          font-size: 18px;
          line-height: 1.8;
        }

        .ih-static-button {
          display: inline-block;
          margin-top: 24px;
          padding: 14px 23px;
          border-radius: 6px;
          background: #c6d99a;
          color: #1b3024 !important;
          font-weight: 700;
          text-decoration: none;
        }

        .ih-static-button:hover {
          background: #d8e6b8;
        }

        .ih-static-section {
          padding: 75px 0;
        }

        .ih-static-section h2 {
          margin: 0 0 16px;
          font-size: clamp(28px, 4vw, 40px);
        }

        .ih-static-section p {
          max-width: 700px;
          color: #d5d8c9;
          line-height: 1.8;
        }

        .ih-static-services {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 18px;
          margin-top: 30px;
        }

        .ih-static-service {
          padding: 24px;
          background: #203b2c;
          border: 1px solid rgba(243,237,223,.13);
          border-radius: 9px;
        }

        .ih-static-service h3 {
          margin-top: 0;
          color: #e4e9d4;
        }

        .ih-static-service p {
          margin-bottom: 0;
          font-size: 14px;
        }

        .ih-static-secondary {
          background: #20372a;
        }

        .ih-static-footer {
          padding: 42px 0;
          border-top: 1px solid rgba(243,237,223,.15);
          background: #12241b;
        }

        .ih-static-footer-inner {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 30px;
          flex-wrap: wrap;
        }

        .ih-static-footer p {
          max-width: 570px;
          color: #c5cbbd;
          font-size: 13px;
          line-height: 1.7;
        }

        .ih-static-footer-links {
          display: flex;
          gap: 18px;
          flex-wrap: wrap;
        }

        .ih-static-footer-links a {
          font-size: 14px;
          text-decoration: none;
        }

        @media (max-width: 600px) {
          .ih-static-hero {
            padding: 70px 0;
          }

          .ih-static-nav {
            gap: 14px;
          }

          .ih-static-section {
            padding: 55px 0;
          }
        }
      `}</style>

      <header className="ih-static-header">
        <div className="ih-static-container ih-static-header-inner">
          <Link href="/" className="ih-static-brand">
            <img
              src="/island-handyman-mark.svg"
              alt=""
              aria-hidden="true"
            />
            <span>ISLAND HANDYMAN</span>
          </Link>

          <nav className="ih-static-nav" aria-label="Main navigation">
            <a href="#services">Services</a>
            <a href="#about">About</a>
            <Link href="/request">Request a job</Link>
            <Link href="/login?next=%2Fcustomer">Client sign-in</Link>
          </nav>
        </div>
      </header>

      <main>
        <section className="ih-static-hero">
          <div className="ih-static-container">
            <div className="ih-static-eyebrow">
              Toronto Island · Local handyman services
            </div>

            <h1>Good work, close to home.</h1>

            <p>
              Practical help with home repairs, maintenance and those jobs
              around the house that need a capable pair of hands.
              Friendly, reliable service right here on the Island.
            </p>

            <Link href="/request" className="ih-static-button">
              Request a job
            </Link>
          </div>
        </section>

        <section id="services" className="ih-static-section">
          <div className="ih-static-container">
            <h2>Useful work, done with care.</h2>

            <p>
              From small repairs to ongoing projects, I provide practical
              help to keep your home and property in good shape.
            </p>

            <div className="ih-static-services">
              <article className="ih-static-service">
                <h3>Home repairs</h3>
                <p>
                  General repairs, installations, adjustments and everyday
                  maintenance around the home.
                </p>
              </article>

              <article className="ih-static-service">
                <h3>Outdoor work</h3>
                <p>
                  Yard work, seasonal cleanup, exterior maintenance and
                  property improvements.
                </p>
              </article>

              <article className="ih-static-service">
                <h3>Ongoing projects</h3>
                <p>
                  Help planning and working through larger jobs, one step
                  at a time.
                </p>
              </article>
            </div>
          </div>
        </section>

        <section id="about" className="ih-static-section ih-static-secondary">
          <div className="ih-static-container">
            <h2>A local approach.</h2>

            <p>
              Island Handyman is about straightforward communication,
              thoughtful work and helping neighbours look after their homes.
              If something needs fixing, improving or taking care of,
              get in touch and we can talk it through.
            </p>

            <Link href="/request" className="ih-static-button">
              Get in touch
            </Link>
          </div>
        </section>
      </main>

      <footer className="ih-static-footer">
        <div className="ih-static-container ih-static-footer-inner">
          <div>
            <strong>ISLAND HANDYMAN</strong>

            <p>
              Practical home and property help on Toronto Island.
            </p>

            <p>
              Client information, messages and project documents are used
              to communicate and manage requested work. Information is
              not sold.
            </p>
          </div>

          <nav className="ih-static-footer-links" aria-label="Footer navigation">
            <Link href="/request">Contact me</Link>
            <Link href="/login?next=%2Fcustomer">Client sign-in</Link>
            <a href="#services">Services</a>
          </nav>

          <TermsOfService />
        </div>
      </footer>
    </div>
  );
}
