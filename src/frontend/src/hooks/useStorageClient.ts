import { HttpAgent } from "@icp-sdk/core/agent";
import { useEffect, useState } from "react";
import { loadConfig } from "../config";
import { StorageClient } from "../utils/StorageClient";
import { useInternetIdentity } from "./useInternetIdentity";

export function useStorageClient() {
  const { identity } = useInternetIdentity();
  const [client, setClient] = useState<StorageClient | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadConfig().then((config) => {
      if (cancelled) return;
      const agent = new HttpAgent({
        identity: identity ?? undefined,
        host: config.backend_host,
      });
      const sc = new StorageClient(
        config.bucket_name,
        config.storage_gateway_url,
        config.backend_canister_id,
        config.project_id,
        agent,
      );
      setClient(sc);
    });
    return () => {
      cancelled = true;
    };
  }, [identity]);

  return client;
}
