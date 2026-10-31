
export default function TermsOfService() {
  return (
    <section
      id="terms-of-service"
      style={{
        width: "100%",
        maxWidth: "900px",
        margin: "24px auto 0",
        color: "#f2eadb",
      }}
    >
      <details
        style={{
          background: "#183b2d",
          border: "1px solid #496b52",
          borderRadius: "10px",
          padding: "16px 20px",
        }}
      >
        <summary
          style={{
            cursor: "pointer",
            fontSize: "15px",
            fontWeight: 600,
            color: "#f2eadb",
          }}
        >
          Terms of Service
        </summary>

        <div
          style={{
            marginTop: "20px",
            lineHeight: 1.7,
            fontSize: "14px",
          }}
        >
          <p>
            <strong>Island Handyman Services</strong>
            <br />
            Last updated: October 31, 2026
          </p>

          <h3>1. Estimates and Pricing</h3>
          <p>
            Estimates are based on the information available when the work is
            discussed. If the job turns out to be different from what was
            expected, I will discuss any changes in the work or price with you
            before proceeding.
          </p>

          <h3>2. Payment</h3>
          <p>
            Payment terms will be agreed upon before work begins. Unless
            otherwise arranged, payment is due when the agreed work is
            completed. Any materials or additional expenses will be discussed
            with you.
          </p>

          <h3>3. Materials and Supplies</h3>
          <p>
            Materials may be supplied by Island Handyman Services or provided
            by the client, depending on the job. Any significant changes in
            material requirements or costs will be discussed beforehand.
          </p>

          <h3>4. Scheduling and Availability</h3>
          <p>
            Work dates and arrival times are arranged in advance. Weather,
            transportation, supply delays, or unexpected circumstances may
            occasionally require a change. If that happens, I will keep you
            informed.
          </p>

          <h3>5. Access and Work Areas</h3>
          <p>
            The client is responsible for arranging reasonable access to the
            work area and letting me know about any known issues that could
            affect the job.
          </p>

          <h3>6. Unexpected Conditions</h3>
          <p>
            Some problems only become visible once work has started. If hidden
            damage, unsafe conditions, or additional work is discovered, I
            will explain the situation and discuss the next steps with you
            before carrying out additional work.
          </p>

          <h3>7. Workmanship</h3>
          <p>
            Work is carried out with reasonable care and attention. If you
            have a concern about completed work, please contact me so we can
            discuss it and determine an appropriate solution.
          </p>

          <h3>8. Property and Safety</h3>
          <p>
            Reasonable care will be taken around your home and property.
            Clients should keep people clear of active work areas and let me
            know about relevant hazards or property concerns.
          </p>

          <h3>9. Privacy</h3>
          <p>
            Information shared with Island Handyman Services is used to
            communicate with clients, arrange work, maintain job records, and
            provide services. Client information is not sold.
          </p>

          <h3>10. Questions</h3>
          <p>
            If anything about these terms or an agreed job is unclear, please
            get in touch. I am always happy to discuss things directly.
          </p>

          <p style={{ marginTop: "24px" }}>
            These terms are governed by the laws of Ontario, Canada.
          </p>
        </div>
      </details>
    </section>
  );
}
