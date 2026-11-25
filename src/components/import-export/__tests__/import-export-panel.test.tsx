import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ImportExportPanel } from "../import-export-panel";
import {
  useSaveDataStore,
  type SavedRecord,
} from "@/app/stores/use-savedata-store";
import * as passActions from "@/app/actions/passwords";
import * as importExportLib from "@/lib/import-export";

vi.mock("@/hooks/use-auth", () => ({
  useAuth: () => ({ user: { id: "user-1" }, isLoading: false }),
}));

vi.mock("@/app/actions/passwords", () => ({
  getUserPasswordsAction: vi
    .fn()
    .mockResolvedValue({ success: true, records: [] }),
  importPasswordsAction: vi.fn(),
}));

const sampleRecords: SavedRecord[] = [
  {
    id: "1",
    site: "github.com",
    email: "dev@example.com",
    username: "octocat",
    password: "secret",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "2",
    site: "google.com",
    email: "personal@gmail.com",
    password: "secret",
    createdAt: "2026-01-02T00:00:00.000Z",
    updatedAt: "2026-01-02T00:00:00.000Z",
  },
];

describe("ImportExportPanel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useSaveDataStore.setState({
      records: sampleRecords,
      isInitialized: true,
      showFavoritesOnly: false,
    });
  });

  it("opens Export as dropdown with CSV and JSON options and exports selected records only", async () => {
    const user = userEvent.setup();
    const downloadSpy = vi
      .spyOn(importExportLib, "downloadTextFile")
      .mockImplementation(() => {});

    render(<ImportExportPanel />);

    // Switch to selective export
    await user.click(screen.getByRole("button", { name: /select records/i }));

    // Select only github.com
    const githubCheckbox = screen.getByRole("checkbox", {
      name: "Select github.com",
    });
    await user.click(githubCheckbox);

    // Open Export dropdown
    const exportBtn = screen.getByRole("button", { name: /export \(1\)/i });
    await user.click(exportBtn);

    expect(await screen.findByText("Export as")).toBeInTheDocument();
    const jsonItem = screen.getByRole("menuitem", { name: "JSON" });
    await user.click(jsonItem);

    expect(downloadSpy).toHaveBeenCalledTimes(1);
    const [exportedContent, filename] = downloadSpy.mock.calls[0];
    expect(filename).toMatch(/^Passy_Passwords_\d{8}_\d{6}\.json$/);
    expect(exportedContent).toContain("github.com");
    expect(exportedContent).not.toContain("google.com");

    downloadSpy.mockRestore();
  });

  it("imports a CSV file automatically and updates store", async () => {
    const user = userEvent.setup();
    const importedRecord: SavedRecord = {
      id: "3",
      site: "gitlab.com",
      email: "work@company.org",
      password: "pw",
      createdAt: "2026-01-03T00:00:00.000Z",
      updatedAt: "2026-01-03T00:00:00.000Z",
    };

    vi.mocked(passActions.importPasswordsAction).mockResolvedValue({
      success: true,
      importedRecords: [importedRecord],
      duplicateCount: 0,
      invalidCount: 0,
    });

    render(<ImportExportPanel />);

    const fileInput = screen.getByLabelText("Import password file");
    const csvContent = "site,email,password\ngitlab.com,work@company.org,pw";
    const file = new File([csvContent], "passwords.csv", { type: "text/csv" });
    Object.defineProperty(file, "text", {
      value: () => Promise.resolve(csvContent),
    });

    await user.upload(fileInput, file);

    await waitFor(() => {
      expect(passActions.importPasswordsAction).toHaveBeenCalledWith([
        {
          site: "gitlab.com",
          email: "work@company.org",
          password: "pw",
        },
      ]);
    });

    expect(await screen.findByText("Imported 1 password")).toBeInTheDocument();
    expect(useSaveDataStore.getState().records).toHaveLength(3);
  });
});
