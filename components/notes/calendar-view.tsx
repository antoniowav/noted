"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
} from "date-fns";
import { ChevronLeft, ChevronRight, ArrowLeft, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useNotes } from "@/hooks/use-notes";
import type { NoteType } from "@/types";
import { useSession } from "next-auth/react";
import { Skeleton } from "@/components/ui/skeleton";

export function CalendarView() {
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const { data: notes, isLoading } = useNotes();
  const { status: sessionStatus } = useSession();

  if (sessionStatus === "loading" || isLoading) {
    return (
      <div className="w-full max-w-4xl mx-auto p-4">
        <div className="flex items-center justify-between mb-6">
          <Skeleton className="h-8 w-40" />
          <div className="flex gap-2">
            <Skeleton className="h-9 w-9" />
            <Skeleton className="h-9 w-9" />
          </div>
        </div>
        <div className="grid grid-cols-7 gap-2">
          {[...Array(35)].map((_, i) => (
            <Skeleton key={i} className="h-[100px] rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const getNotesForDay = (date: Date) => {
    return (
      notes?.data?.filter((note: NoteType) =>
        isSameDay(new Date(note.createdAt), date)
      ) || []
    );
  };

  const selectedNotes = selectedDay ? getNotesForDay(selectedDay) : [];

  return (
    <div className="w-full max-w-4xl mx-auto p-2 sm:p-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-2xl font-semibold">
            {format(currentDate, "MMMM yyyy")}
          </h2>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() =>
              setCurrentDate(
                new Date(currentDate.setMonth(currentDate.getMonth() - 1))
              )
            }
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() =>
              setCurrentDate(
                new Date(currentDate.setMonth(currentDate.getMonth() + 1))
              )
            }
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2 sm:gap-3 mb-4">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
          <div
            key={day}
            className="text-center font-medium p-1 sm:p-2 text-xs sm:text-sm text-muted-foreground"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2 sm:gap-3">
        {eachDayOfInterval({
          start: startOfMonth(currentDate),
          end: endOfMonth(currentDate),
        }).map((day) => {
          const dayNotes = getNotesForDay(day);
          return (
            <Card
              key={day.toString()}
              className={`min-h-[70px] sm:min-h-[100px] p-2 sm:p-4 cursor-pointer transition-colors w-[calc(100vw/8)] sm:w-auto ${
                dayNotes.length ? "bg-secondary/50 hover:bg-secondary/70" : ""
              }`}
              onClick={() => dayNotes.length && setSelectedDay(day)}
            >
              <div className="text-base sm:text-sm mb-2 font-medium">
                {format(day, "d")}
              </div>
              {dayNotes.length > 0 && (
                <div className="flex items-center gap-1 text-muted-foreground">
                  <FileText className="h-3 w-3" />
                  <span className="text-xs">{dayNotes.length}</span>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      <Dialog open={!!selectedDay} onOpenChange={() => setSelectedDay(null)}>
        <DialogContent className="sm:max-w-[425px] gap-6 p-6 mx-4 sm:mx-auto max-w-[calc(100%-2rem)] rounded-lg">
          <DialogHeader>
            <DialogTitle>
              Notes for {selectedDay && format(selectedDay, "MMMM d, yyyy")}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto">
            {selectedNotes.map((note) => (
              <Card key={note._id} className="p-4">
                <p className="font-medium">{note.title}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {note.content}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  {format(new Date(note.createdAt), "h:mm a")}
                </p>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
