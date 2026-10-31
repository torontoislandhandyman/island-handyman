
export default function TermsOfService() {
  return (
    <section
      id="terms-of-service"
      style={{
        background: "#142b20",
        color: "#eee9dc",
        padding: "24px 18px",
        borderTop: "1px solid #52664f",
        fontSize: "14px",
        lineHeight: 1.7,
      }}
    >
      <details>
        <summary
          style={{
            cursor: "pointer",
            color: "#d6c69b",
            fontWeight: 600,
            fontSize: "15px",
          }}
        >
          Terms of Service
        </summary>

        <div style={{ maxWidth: "850px", margin: "20px auto" }}>
          <h2>Island Handyman</h2>
          <p><strong>Simple Terms of Service</strong></p>
          <p>Effective Date: October 31, 2026</p>

          <p>
            Welcome to Island Handyman. My goal is to provide reliable,
            practical, and honest handyman services to clients on Toronto Island.
            By requesting or accepting services, you agree to the following terms.
          </p>

          <h3>1. Services and Estimates</h3>
          <p>
            Work and pricing will be discussed before work begins.
            Estimates are based on available information. If unexpected
            problems or additional work arise, I will discuss changes
            in scope or cost before proceeding whenever reasonably possible.
          </p>

          <h3>2. Pricing and Payment</h3>
          <p>
            Payment arrangements will be agreed upon in advance.
            Unless otherwise agreed, payment is due when the agreed
            work is completed. Additional work, materials, or expenses
            outside the original agreement may incur extra charges.
          </p>

          <h3>3. Materials and Expenses</h3>
          <p>
            Materials, supplies, and applicable travel or delivery
            charges will be discussed in advance and either included
            in the agreed price or charged separately.
          </p>

          <h3>4. Scheduling and Cancellations</h3>
          <p>
            Appointments are arranged by mutual agreement. Weather,
            transportation, emergencies, or material delays may require
            rescheduling. I will make reasonable efforts to notify you
            of changes as soon as possible.
          </p>

          <h3>5. Access and Work Areas</h3>
          <p>
            Clients agree to provide reasonable access to the work area
            and disclose any known hazards, existing damage, or special
            concerns before work begins.
          </p>

          <h3>6. Unexpected Problems</h3>
          <p>
            Repairs may reveal hidden damage or problems that could not
            reasonably be identified beforehand. If this happens, I will
            explain the situation and discuss options and additional
            costs before proceeding with further work.
          </p>

          <h3>7. Workmanship and Limitations</h3>
          <p>
            I will make reasonable efforts to complete agreed work
            carefully and professionally. If you have concerns about
            completed work, please contact me promptly so we can discuss
            an appropriate solution.
          </p>
          <p>
            Specialized or licensed work will only be undertaken when
            legally permitted and specifically agreed upon. Work may
            also be affected by existing conditions, third-party products,
            or circumstances outside my reasonable control.
          </p>

          <h3>8. Property and Safety</h3>
          <p>
            I will take reasonable care to protect your property and
            maintain a safe work area. Any relevant access restrictions
            or safety concerns should be communicated before work begins.
          </p>

          <h3>9. Client Information and Privacy</h3>
          <p>
            Client contact details, project information, photographs,
            and messages will be used as reasonably necessary to arrange,
            perform, and manage the requested work. Private client
            information will not be publicly shared without permission,
            except where legally required.
          </p>

          <h3>10. Questions or Concerns</h3>
          <p>
            If you have questions about these terms, an estimate,
            an invoice, or completed work, please contact me directly.
            I believe clear communication and fair solutions are
            the best way to resolve concerns.
          </p>

          <h3>11. Applicable Law</h3>
          <p>
            These terms are governed by the laws of Ontario and the
            applicable laws of Canada. Nothing in these terms removes
            any rights clients have under applicable law.
          </p>

          <p style={{ marginTop: "24px", color: "#d6c69b" }}>
            Thank you for choosing Island Handyman. I appreciate
            your business and the opportunity to help.
          </p>
        </div>
      </details>

      <div
        style={{
          textAlign: "center",
          marginTop: "20px",
          opacity: 0.7,
          fontSize: "12px",
        }}
      >
        © {new Date().getFullYear()} Island Handyman
      </div>
    </section>
  );
}
