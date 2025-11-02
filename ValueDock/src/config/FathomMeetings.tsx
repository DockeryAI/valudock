import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { ExternalLink, Calendar, Loader2 } from "lucide-react";

type Meeting = {
  ["VD.Title"]?: string;
  ["VD.Date"]?: string;
  ["VD.Url"]?: string;
  ["VD.Summary"]?: string;
  title?: string;
  created_at?: string;
  share_url?: string;
};

const ENDPOINT =
  "https://hpnxaentcrlditokrpyo.functions.supabase.co/fathom-server?domain=thephoenixinsurance.com&since=2025-07-01&limit=5&summarize=0";

export default function FathomMeetings() {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [meetings, setMeetings] = useState<Meeting[]>([]);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setErr(null);
        const r = await fetch(ENDPOINT);
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const data = await r.json();
        const list: Meeting[] = Array.isArray(data?.meetings)
          ? data.meetings
          : [];
        setMeetings(list);
      } catch (e: any) {
        setErr(e?.message ?? "Failed to load meetings");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Fathom Meeting Summaries
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Loading meetings...</span>
          </div>
        )}
        
        {err && (
          <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-4">
            <p className="text-sm text-destructive font-medium">Error: {err}</p>
          </div>
        )}
        
        {!loading && !err && meetings.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-2 opacity-20" />
            <p>No meetings found.</p>
          </div>
        )}
        
        {!loading && !err && meetings.length > 0 && (
          <div className="grid gap-3">
            {meetings.map((m, i) => {
              const title = m["VD.Title"] ?? m.title ?? "Untitled";
              const date = m["VD.Date"] ?? m.created_at ?? "";
              const url = m["VD.Url"] ?? (m as any).share_url ?? "";
              const summary = m["VD.Summary"] ?? "";
              
              return (
                <div
                  key={i}
                  className="rounded-lg border bg-card p-4 hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h4 className="font-semibold">{title}</h4>
                    {date && (
                      <Badge variant="outline" className="shrink-0">
                        {new Date(date).toLocaleDateString()}
                      </Badge>
                    )}
                  </div>
                  
                  {summary && (
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap mb-3">
                      {summary}
                    </p>
                  )}
                  
                  {url && (
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                    >
                      <a
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2"
                      >
                        <ExternalLink className="h-3 w-3" />
                        Open Meeting
                      </a>
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}