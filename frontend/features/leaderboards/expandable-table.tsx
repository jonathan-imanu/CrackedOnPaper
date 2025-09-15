"use client";

import React, { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useOutsideClick } from "@/hooks/use-outside-click";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  TrendingUp,
  TrendingDown,
  Users,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { ResumeViewerContent } from "@/features/resumes/components/resume-viewer/resume-viewer-content";

interface ResumeData {
  id: number;
  rank: number;
  elo: number;
  battles: number;
  winRate: number;
  industry: string;
  level: string;
  lastActive: string;
  skills: string[];
  experience: string;
  education: string;
  achievements: string[];
  resumeName: string;
  imageKeyPrefix: string;
  cdnUrl: string;
}

interface ExpandableTableProps {
  data: ResumeData[];
  title: string;
}

const ITEMS_PER_PAGE = 20;

export function ExpandableTable({ data, title }: ExpandableTableProps) {
  const [active, setActive] = useState<ResumeData | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const id = useId();
  const ref = useRef<HTMLDivElement>(null);

  // Calculate pagination
  const totalPages = Math.ceil(data.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentData = data.slice(startIndex, endIndex);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setActive(null);
      }
    }

    if (active) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [active]);

  useOutsideClick(ref as React.RefObject<HTMLDivElement>, () =>
    setActive(null)
  );

  const getRankIcon = (rank: number) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return `#${rank}`;
  };

  const getEloChange = (elo: number) => {
    // Mock elo change for demo
    const change = Math.floor(Math.random() * 50) - 25;
    return change;
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top of table
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 h-full w-full z-10"
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {active ? (
          <div className="fixed inset-0 grid place-items-center z-[100]">
            <motion.button
              key={`button-${active.id}-${id}`}
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.05 } }}
              className="flex absolute top-4 right-4 lg:top-6 lg:right-6 items-center justify-center bg-white dark:bg-neutral-900 rounded-full h-10 w-10 z-20"
              onClick={() => setActive(null)}
            >
              <CloseIcon />
            </motion.button>

            <motion.div
              layoutId={`card-${active.id}-${id}`}
              ref={ref}
              className="max-w-6xl w-[98vw] h-[95vh] overflow-hidden p-0 bg-background border border-border shadow-2xl rounded-lg"
            >
              {/* Header */}
              <motion.div
                layoutId={`header-${active.id}-${id}`}
                className="px-6 py-4 border-b bg-muted/30 flex flex-row items-center justify-between flex-shrink-0"
              >
                <div className="flex items-center gap-4">
                  <div className="text-2xl">{getRankIcon(active.rank)}</div>
                  <motion.h3
                    layoutId={`title-${active.id}-${id}`}
                    className="text-xl font-semibold"
                  >
                    {active.resumeName}
                  </motion.h3>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-primary">
                    {active.elo}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Elo Rating
                  </div>
                </div>
              </motion.div>

              {/* Resume Viewer Content */}
              <div className="relative flex-1 overflow-hidden">
                <ResumeViewerContent
                  resumeName={active.resumeName}
                  imageKeyPrefix={active.imageKeyPrefix}
                  cdnUrl={active.cdnUrl}
                />
              </div>

              {/* Footer */}
              <div className="px-6 py-3 border-t bg-muted/30 flex-shrink-0">
                <div className="text-center text-sm text-muted-foreground">
                  <p>
                    {active.industry} • {active.level}
                  </p>
                  <p className="mt-1">
                    Use mouse wheel to zoom, drag to pan, or use the controls
                    above.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{title}</span>
            <div className="flex items-center gap-4">
              <Badge variant="secondary">Updated 2 minutes ago</Badge>
              <span className="text-sm text-muted-foreground">
                Showing {startIndex + 1}-{Math.min(endIndex, data.length)} of{" "}
                {data.length} resumes
              </span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Rank</TableHead>
                  <TableHead>Resume</TableHead>
                  <TableHead>Industry</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead className="text-right">Elo</TableHead>
                  <TableHead className="text-right">Battles</TableHead>
                  <TableHead className="text-right">Win Rate</TableHead>
                  <TableHead className="text-right">Last Active</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentData.map((resume) => {
                  const eloChange = getEloChange(resume.elo);
                  return (
                    <motion.tr
                      layoutId={`card-${resume.id}-${id}`}
                      key={resume.id}
                      onClick={() => setActive(resume)}
                      className="cursor-pointer hover:bg-muted/50 transition-colors"
                    >
                      <TableCell>
                        <motion.div
                          layoutId={`rank-${resume.id}-${id}`}
                          className="text-2xl font-bold"
                        >
                          {getRankIcon(resume.rank)}
                        </motion.div>
                      </TableCell>
                      <TableCell>
                        <motion.div
                          layoutId={`title-${resume.id}-${id}`}
                          className="font-semibold"
                        >
                          {resume.resumeName}
                        </motion.div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{resume.industry}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{resume.level}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <motion.div
                            layoutId={`elo-${resume.id}-${id}`}
                            className="text-xl font-bold text-primary"
                          >
                            {resume.elo}
                          </motion.div>
                          {eloChange !== 0 && (
                            <div className="flex items-center gap-1">
                              {eloChange > 0 ? (
                                <TrendingUp className="w-4 h-4 text-green-500" />
                              ) : (
                                <TrendingDown className="w-4 h-4 text-red-500" />
                              )}
                              <span
                                className={`text-sm font-medium ${
                                  eloChange > 0
                                    ? "text-green-500"
                                    : "text-red-500"
                                }`}
                              >
                                {eloChange > 0 ? "+" : ""}
                                {eloChange}
                              </span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Users className="w-4 h-4 text-muted-foreground" />
                          <span>{resume.battles}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge
                          variant={
                            resume.winRate > 0.7 ? "default" : "secondary"
                          }
                        >
                          {(resume.winRate * 100).toFixed(0)}%
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right text-sm text-muted-foreground">
                        {resume.lastActive}
                      </TableCell>
                    </motion.tr>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </Button>

                {/* Page numbers */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum: number;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <Button
                        key={pageNum}
                        variant={
                          currentPage === pageNum ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() => handlePageChange(pageNum)}
                        className="w-8 h-8 p-0"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}

export const CloseIcon = () => {
  return (
    <motion.svg
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.05 } }}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4 text-foreground"
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M18 6l-12 12" />
      <path d="M6 6l12 12" />
    </motion.svg>
  );
};
