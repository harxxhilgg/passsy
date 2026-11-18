import { beforeEach, describe, expect, it } from "vitest";
import { usePasswordHistoryStore } from "../use-password-history-store";

describe("usePasswordHistoryStore", () => {
  beforeEach(() => {
    usePasswordHistoryStore.getState().clearHistory();
  });

  it("adds activity entries with site and action", () => {
    const { addActivity } = usePasswordHistoryStore.getState();

    addActivity({ site: "github.com", action: "saved" });
    const history = usePasswordHistoryStore.getState().history;

    expect(history).toHaveLength(1);
    expect(history[0].site).toBe("github.com");
    expect(history[0].action).toBe("saved");
    expect(history[0].timestamp).toBeDefined();
  });

  it("does not add consecutive identical activity within 2 seconds", () => {
    const { addActivity } = usePasswordHistoryStore.getState();

    addActivity({ site: "google.com", action: "saved" });
    addActivity({ site: "google.com", action: "saved" });

    expect(usePasswordHistoryStore.getState().history).toHaveLength(1);
  });

  it("records deleted action for a site", () => {
    const { addActivity } = usePasswordHistoryStore.getState();

    addActivity({ site: "twitter.com", action: "deleted" });
    const history = usePasswordHistoryStore.getState().history;

    expect(history).toHaveLength(1);
    expect(history[0].site).toBe("twitter.com");
    expect(history[0].action).toBe("deleted");
  });

  it("removes activity entry by id", () => {
    const { addActivity, removeActivity } = usePasswordHistoryStore.getState();

    addActivity({ site: "site1.com", action: "saved" });
    addActivity({ site: "site2.com", action: "saved" });

    const idToRemove = usePasswordHistoryStore.getState().history[0].id;
    removeActivity(idToRemove);

    expect(usePasswordHistoryStore.getState().history).toHaveLength(1);
    expect(usePasswordHistoryStore.getState().history[0].site).toBe(
      "site1.com"
    );
  });

  it("clears entire history", () => {
    const { addActivity, clearHistory } = usePasswordHistoryStore.getState();

    addActivity({ site: "site1.com", action: "saved" });
    addActivity({ site: "site2.com", action: "saved" });
    expect(usePasswordHistoryStore.getState().history).toHaveLength(2);

    clearHistory();
    expect(usePasswordHistoryStore.getState().history).toHaveLength(0);
  });

  it("seeds history from existing records without duplicating", () => {
    const { seedFromExistingRecords } = usePasswordHistoryStore.getState();

    seedFromExistingRecords([
      { site: "netflix.com", createdAt: "2026-01-01T00:00:00Z" },
      { site: "spotify.com", createdAt: "2026-02-01T00:00:00Z" },
    ]);

    expect(usePasswordHistoryStore.getState().history).toHaveLength(2);
    expect(usePasswordHistoryStore.getState().history[0].site).toBe(
      "spotify.com"
    );

    // Re-seeding same sites should not add duplicates
    seedFromExistingRecords([
      { site: "netflix.com", createdAt: "2026-01-01T00:00:00Z" },
    ]);
    expect(usePasswordHistoryStore.getState().history).toHaveLength(2);
  });
});
