import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach } from "vitest";
import type { AuthChangeEvent, Session } from "@supabase/supabase-js";
import { AuthButton } from "../auth-button";

// Mock Supabase client
const mockSignInWithOAuth = vi.fn();
const mockSignOut = vi.fn();
const mockGetUser = vi.fn();
const mockOnAuthStateChange = vi.fn();

vi.mock("@/utils/supabase/client", () => ({
  createClient: () => ({
    auth: {
      signInWithOAuth: mockSignInWithOAuth,
      signOut: mockSignOut,
      getUser: mockGetUser,
      onAuthStateChange: (
        cb: (event: AuthChangeEvent, session: Session | null) => void
      ) => {
        mockOnAuthStateChange(cb);
        return {
          data: {
            subscription: {
              unsubscribe: vi.fn(),
            },
          },
        };
      },
    },
  }),
}));

describe("AuthButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });
    mockSignInWithOAuth.mockResolvedValue({ data: {}, error: null });
    mockSignOut.mockResolvedValue({ error: null });
  });

  it("renders 'Sign in' button when logged out", async () => {
    render(<AuthButton />);

    const button = await screen.findByRole("button", { name: /sign in/i });
    expect(button).toBeInTheDocument();
  });

  it("triggers Google OAuth sign in on button click", async () => {
    const user = userEvent.setup();
    render(<AuthButton />);

    const button = await screen.findByRole("button", { name: /sign in/i });
    await user.click(button);

    expect(mockSignInWithOAuth).toHaveBeenCalledWith({
      provider: "google",
      options: {
        redirectTo: expect.stringContaining("/auth/callback"),
      },
    });
  });

  it("renders user name and avatar when logged in", async () => {
    mockGetUser.mockResolvedValue({
      data: {
        user: {
          id: "123",
          email: "harshil@example.com",
          user_metadata: {
            full_name: "Harshil Patel",
            avatar_url: "https://example.com/avatar.png",
          },
        },
      },
      error: null,
    });

    render(<AuthButton />);

    expect(await screen.findByText("Harshil Patel")).toBeInTheDocument();
  });

  it("opens dropdown menu on user button click and shows logout button", async () => {
    const user = userEvent.setup();
    mockGetUser.mockResolvedValue({
      data: {
        user: {
          id: "123",
          email: "harshil@example.com",
          user_metadata: {
            full_name: "Harshil Patel",
          },
        },
      },
      error: null,
    });

    render(<AuthButton />);

    const userButton = await screen.findByRole("button", {
      name: /harshil patel/i,
    });

    await user.click(userButton);

    const historyItem = await screen.findByRole("menuitem", {
      name: /history/i,
    });
    expect(historyItem).toBeInTheDocument();

    expect(screen.getByText("Appearance")).toBeInTheDocument();

    expect(
      screen.getByRole("menuitem", { name: /theme/i })
    ).toBeInTheDocument();

    expect(screen.getByText("Danger Zone")).toBeInTheDocument();

    const logoutItem = await screen.findByRole("menuitem", {
      name: /logout|log out/i,
    });

    expect(logoutItem).toBeInTheDocument();
  });

  it("opens alert dialog when logout item is clicked and handles logout", async () => {
    const user = userEvent.setup();

    mockGetUser.mockResolvedValue({
      data: {
        user: {
          id: "123",
          email: "harshil@example.com",
          user_metadata: {
            full_name: "Harshil Patel",
          },
        },
      },
      error: null,
    });

    render(<AuthButton />);

    const userButton = await screen.findByRole("button", {
      name: /harshil patel/i,
    });

    await user.click(userButton);

    const logoutItem = await screen.findByRole("menuitem", {
      name: /logout|log out/i,
    });
    await user.click(logoutItem);

    // Alert dialog should appear with title and two buttons
    expect(await screen.findByRole("alertdialog")).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: /^cancel$/i })
    ).toBeInTheDocument();

    // There are two log out buttons in the DOM (one in menu, one in alert dialog)
    // Find the alert dialog action button:
    const confirmLogoutButton = screen.getByRole("button", {
      name: /^logout$|^log out$/i,
    });

    expect(confirmLogoutButton).toBeInTheDocument();

    await user.click(confirmLogoutButton);

    expect(mockSignOut).toHaveBeenCalled();
  });

  it("shows spinner in logout button during logout instead of text", async () => {
    const user = userEvent.setup();

    mockGetUser.mockResolvedValue({
      data: {
        user: {
          id: "123",
          email: "harshil@example.com",
          user_metadata: {
            full_name: "Harshil Patel",
          },
        },
      },
      error: null,
    });

    // Make signOut hang so we can assert the spinner state
    let resolveSignOut: () => void = () => { };

    mockSignOut.mockReturnValue(
      new Promise<{ error: null }>((resolve) => {
        resolveSignOut = () => resolve({ error: null });
      })
    );

    render(<AuthButton />);

    const userButton = await screen.findByRole("button", {
      name: /harshil patel/i,
    });

    await user.click(userButton);

    const logoutItem = await screen.findByRole("menuitem", {
      name: /logout|log out/i,
    });

    await user.click(logoutItem);

    const confirmLogoutButton = screen.getByRole("button", {
      name: /^logout$|^log out$/i,
    });

    await user.click(confirmLogoutButton);

    // After clicking, the button should have spinner with role status / aria-label Loading
    expect(
      screen.getByRole("status", { name: /loading/i })
    ).toBeInTheDocument();

    // The button no longer has "Logout" text
    expect(
      screen.queryByRole("button", { name: /^logout$|^log out$/i })
    ).not.toBeInTheDocument();

    resolveSignOut();
  });

  it("shows spinner in sign in button while signing in", async () => {
    const user = userEvent.setup();

    let resolveSignIn: () => void = () => { };

    mockSignInWithOAuth.mockReturnValue(
      new Promise<{ data: Record<string, unknown>; error: null }>((resolve) => {
        resolveSignIn = () => resolve({ data: {}, error: null });
      })
    );

    render(<AuthButton />);

    const signInButton = await screen.findByRole("button", {
      name: /sign in/i,
    });

    await user.click(signInButton);

    // Spinner should appear in place of "Sign in" text
    expect(
      screen.getByRole("status", { name: /loading/i })
    ).toBeInTheDocument();

    expect(
      screen.queryByRole("button", { name: /sign in/i })
    ).not.toBeInTheDocument();

    resolveSignIn();
  });
});
