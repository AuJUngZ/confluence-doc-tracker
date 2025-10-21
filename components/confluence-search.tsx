"use client";

import { useState, useEffect } from "react";
import type { SearchResponse, DocumentContribution } from "@/types/confluence";
import type { ConfluenceConfig } from "@/types/config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  Calendar,
  Search,
  Copy,
  Check,
  FileText,
  FolderOpen,
  Info,
  AlertCircle,
  Server,
  User,
  ChevronRight,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

export default function ConfluenceSearch() {
  // Get current year's date range as default
  const getCurrentYearRange = () => {
    const now = new Date();
    const year = now.getFullYear();
    return {
      start: `${year}-01-01`,
      end: `${year}-12-31`,
    };
  };

  const defaultRange = getCurrentYearRange();
  const [startDate, setStartDate] = useState(defaultRange.start);
  const [endDate, setEndDate] = useState(defaultRange.end);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResponse | null>(null);
  const [error, setError] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(
    new Set()
  );
  const [config, setConfig] = useState<ConfluenceConfig | null>(null);
  const [configLoading, setConfigLoading] = useState(true);

  // Fetch configuration from API
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch("/api/confluence/config");
        if (response.ok) {
          const data = await response.json();
          setConfig(data);
        }
      } catch (err) {
        console.error("Failed to fetch config:", err);
      } finally {
        setConfigLoading(false);
      }
    };
    fetchConfig();
  }, []);

  const toggleGroup = (pathKey: string) => {
    setCollapsedGroups((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(pathKey)) {
        newSet.delete(pathKey);
      } else {
        newSet.add(pathKey);
      }
      return newSet;
    });
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResults(null);

    try {
      const response = await fetch("/api/confluence/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          startDate: startDate || undefined,
          endDate: endDate || undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch data");
      }

      const data: SearchResponse = await response.json();
      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (url: string, id: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  // Group documents by space and parent path
  const groupByPath = (documents: DocumentContribution[]) => {
    const grouped = new Map<
      string,
      {
        space: { key: string; name: string } | undefined;
        path: string;
        pathArray: string[];
        documents: DocumentContribution[];
      }
    >();

    documents.forEach((doc) => {
      // Create path from space and ancestors
      const spaceName = doc.space?.name || "Unknown Space";
      const pathArray = doc.ancestors?.map((a) => a.title) || [];
      const fullPath = [spaceName, ...pathArray].join(" › ");

      if (!grouped.has(fullPath)) {
        grouped.set(fullPath, {
          space: doc.space,
          path: fullPath,
          pathArray: [spaceName, ...pathArray],
          documents: [],
        });
      }
      grouped.get(fullPath)!.documents.push(doc);
    });

    return grouped;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 dark:from-slate-950 dark:via-blue-950 dark:to-slate-900">
      <div className="mx-auto max-w-6xl space-y-8 p-6">
        {/* Header */}
        <div className="text-center space-y-4 py-8 relative">
          <div className="absolute top-0 right-0">
            <ThemeToggle />
          </div>
          <div className="flex items-center justify-center gap-4">
            <FileText className="h-10 w-10 text-primary" />
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-violet-600 dark:from-blue-400 dark:to-violet-400 bg-clip-text text-transparent">
              Confluence Document Tracker
            </h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Search and track documents you've contributed to in Confluence
          </p>
        </div>

        {/* Configuration Info */}
        <Alert variant="info">
          <Info className="h-4 w-4" />
          <AlertTitle className="flex items-center gap-2">
            Configuration
          </AlertTitle>
          <AlertDescription>
            {configLoading ? (
              <p>Loading configuration...</p>
            ) : config ? (
              <div className="mt-2 space-y-2">
                <div className="flex items-center gap-2">
                  <Server className="h-4 w-4" />
                  <span className="font-medium">Domain:</span>
                  <span className="font-mono text-sm">
                    {config.confluenceDomain || "Not specified"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span className="font-medium">User:</span>
                  <span>
                    {config.userDisplayName
                      ? `${config.userDisplayName} (${config.userEmail})`
                      : config.userEmail || "Not specified"}
                  </span>
                </div>
                <Separator className="my-2" />
                <p className="text-xs text-muted-foreground">
                  The system will search for documents you created or modified
                </p>
              </div>
            ) : (
              <p className="text-destructive">Failed to load configuration</p>
            )}
          </AlertDescription>
        </Alert>

        {/* Search Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Search Documents
            </CardTitle>
            <CardDescription>
              Select a date range to search for modified documents
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label
                    htmlFor="startDate"
                    className="flex items-center gap-2"
                  >
                    <Calendar className="h-4 w-4" />
                    Start Date
                  </Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endDate" className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    End Date
                  </Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full"
                size="lg"
              >
                <Search className="mr-2 h-4 w-4" />
                {loading ? "Searching..." : "Search Documents"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Error Message */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Results */}
        {results && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Search Results
              </CardTitle>
              <CardDescription className="flex items-center gap-2 flex-wrap">
                <span>
                  Found{" "}
                  <Badge variant="default" className="inline-flex mx-1">
                    {results.totalCount}
                  </Badge>{" "}
                  documents contributed by{" "}
                  <span className="font-semibold">{results.searchedUser}</span>
                </span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              {results.documents.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    No documents found matching the search criteria
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {Array.from(groupByPath(results.documents)).map(
                    ([pathKey, group]) => {
                      const isCollapsed = collapsedGroups.has(pathKey);
                      return (
                        <div key={pathKey} className="space-y-4">
                          {/* Path Header with Breadcrumb */}
                          <button
                            onClick={() => toggleGroup(pathKey)}
                            className="w-full flex items-start gap-3 p-4 rounded-lg bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-l-4 border-primary hover:from-primary/15 hover:via-primary/8 transition-colors cursor-pointer"
                          >
                            <FolderOpen className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                            <div className="flex-1 min-w-0 text-left">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge variant="secondary">
                                  {group.documents.length}{" "}
                                  {group.documents.length === 1
                                    ? "document"
                                    : "documents"}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-1.5 flex-wrap text-sm">
                                {group.pathArray.map((part, idx) => (
                                  <div
                                    key={idx}
                                    className="flex items-center gap-1.5"
                                  >
                                    <span
                                      className={
                                        idx === 0
                                          ? "font-bold text-primary"
                                          : "text-muted-foreground"
                                      }
                                    >
                                      {part}
                                    </span>
                                    {idx < group.pathArray.length - 1 && (
                                      <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50" />
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                            {isCollapsed ? (
                              <ChevronDown className="h-5 w-5 text-primary flex-shrink-0" />
                            ) : (
                              <ChevronUp className="h-5 w-5 text-primary flex-shrink-0" />
                            )}
                          </button>

                          {/* Documents in this path */}
                          {!isCollapsed && (
                            <div className="space-y-3 ml-4 pl-4 border-l-2 border-muted animate-in fade-in slide-in-from-top-2 duration-300">
                              {group.documents.map((doc) => (
                                <Card
                                  key={doc.id}
                                  variant="elevated"
                                  className="group cursor-pointer"
                                  onClick={() => window.open(doc.url, "_blank")}
                                >
                                  <CardContent className="p-5">
                                    <div className="flex justify-between items-start gap-4">
                                      <div className="flex-1 min-w-0 space-y-3">
                                        <div>
                                          <h4 className="text-lg font-semibold mb-1 break-words group-hover:text-primary transition-colors">
                                            {doc.title}
                                          </h4>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                                          <div className="flex items-center gap-2 text-muted-foreground">
                                            <User className="h-4 w-4 flex-shrink-0" />
                                            <span className="truncate">
                                              {doc.modifiedBy}
                                            </span>
                                          </div>
                                          <div className="flex items-center gap-2 text-muted-foreground">
                                            <Calendar className="h-4 w-4 flex-shrink-0" />
                                            <span>
                                              {formatDate(doc.lastModified)}
                                            </span>
                                          </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                          <Badge variant="outline">
                                            v{doc.version}
                                          </Badge>
                                          <a
                                            href={doc.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-xs text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1 truncate"
                                          >
                                            <ExternalLink className="h-3 w-3 flex-shrink-0" />
                                            <span className="truncate">
                                              Open in Confluence
                                            </span>
                                          </a>
                                        </div>
                                      </div>

                                      <Button
                                        variant={
                                          copiedId === doc.id
                                            ? "secondary"
                                            : "outline"
                                        }
                                        size="sm"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          copyToClipboard(doc.url, doc.id);
                                        }}
                                        className="flex-shrink-0"
                                      >
                                        {copiedId === doc.id ? (
                                          <>
                                            <Check className="mr-2 h-4 w-4" />
                                            Copied
                                          </>
                                        ) : (
                                          <>
                                            <Copy className="mr-2 h-4 w-4" />
                                            Copy URL
                                          </>
                                        )}
                                      </Button>
                                    </div>
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    }
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
