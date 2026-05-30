/**
 * Unit test untuk komponen SessionProvider.
 *
 * Menguji bahwa SessionProvider merender children-nya dengan benar.
 */
import { render, screen } from "@testing-library/react";
import { SessionProvider } from "@/components/providers/SessionProvider";

// Mock next-auth/react SessionProvider
jest.mock("next-auth/react", () => ({
  SessionProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

describe("SessionProvider", () => {
  it("harus merender children dengan benar", () => {
    render(
      <SessionProvider>
        <div>Test Child</div>
      </SessionProvider>,
    );
    expect(screen.getByText("Test Child")).toBeInTheDocument();
  });

  it("harus merender multiple children", () => {
    render(
      <SessionProvider>
        <span>Child 1</span>
        <span>Child 2</span>
      </SessionProvider>,
    );
    expect(screen.getByText("Child 1")).toBeInTheDocument();
    expect(screen.getByText("Child 2")).toBeInTheDocument();
  });
});
