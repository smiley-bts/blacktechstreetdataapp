import { useState, useMemo } from "react";
import { useParticipantMetrics } from "@/hooks/useParticipantMetrics";
import { useParticipants } from "@/hooks/useParticipants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { CountUp } from "@/components/ui/count-up";
import { Calendar, Users, Search, Filter, ChevronRight, CheckCircle, Clock, TrendingUp, Crown, Briefcase, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

interface AttendeesDashboardProps {
  onContactClick?: (email: string) => void;
}

export function AttendeesDashboard({ onContactClick }: AttendeesDashboardProps) {
  const { metrics, isLoading } = useParticipantMetrics();
  const { participants, isLoading: participantsLoading } = useParticipants();
  const [activeEventTab, setActiveEventTab] = useState("all");
  const [demographicFilter, setDemographicFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Get unique events from metrics
  const events = useMemo(() => {
    return metrics.eventSummaries || [];
  }, [metrics.eventSummaries]);

  // Get attendees based on active filters
  const filteredAttendees = useMemo(() => {
    let attendees = participants.filter(p => !p.is_stakeholder);
    
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      attendees = attendees.filter(p => 
        p.full_name?.toLowerCase().includes(query) ||
        p.primary_email?.toLowerCase().includes(query) ||
        p.company_name?.toLowerCase().includes(query)
      );
    }

    // Demographic filter
    if (demographicFilter !== "all") {
      switch (demographicFilter) {
        case "age-18-24":
          attendees = attendees.filter(p => p.age_range?.includes("18-24"));
          break;
        case "age-25-34":
          attendees = attendees.filter(p => p.age_range?.includes("25-34"));
          break;
        case "age-35-44":
          attendees = attendees.filter(p => p.age_range?.includes("35-44"));
          break;
        case "age-45+":
          attendees = attendees.filter(p => p.age_range?.includes("45") || p.age_range?.includes("55") || p.age_range?.includes("65"));
          break;
        case "beginner":
          attendees = attendees.filter(p => p.ai_experience_level?.toLowerCase().includes("beginner") || p.ai_experience_level?.toLowerCase().includes("none"));
          break;
        case "intermediate":
          attendees = attendees.filter(p => p.ai_experience_level?.toLowerCase().includes("intermediate") || p.ai_experience_level?.toLowerCase().includes("some"));
          break;
        case "advanced":
          attendees = attendees.filter(p => p.ai_experience_level?.toLowerCase().includes("advanced") || p.ai_experience_level?.toLowerCase().includes("expert"));
          break;
      }
    }

    return attendees;
  }, [participants, searchQuery, demographicFilter]);

  // Demographic breakdown
  const demographicBreakdown = useMemo(() => {
    const attendees = participants.filter(p => !p.is_stakeholder);
    
    const ageGroups: Record<string, number> = {};
    const industries: Record<string, number> = {};
    const aiLevels: Record<string, number> = {};
    const locations: Record<string, number> = {};

    attendees.forEach(p => {
      // Age
      if (p.age_range) {
        ageGroups[p.age_range] = (ageGroups[p.age_range] || 0) + 1;
      }
      // Industry
      if (p.industry) {
        industries[p.industry] = (industries[p.industry] || 0) + 1;
      }
      // AI Level
      if (p.ai_experience_level) {
        aiLevels[p.ai_experience_level] = (aiLevels[p.ai_experience_level] || 0) + 1;
      }
      // Location
      if (p.city || p.state) {
        const loc = [p.city, p.state].filter(Boolean).join(", ");
        locations[loc] = (locations[loc] || 0) + 1;
      }
    });

    return {
      ageGroups: Object.entries(ageGroups).sort((a, b) => b[1] - a[1]).slice(0, 5),
      industries: Object.entries(industries).sort((a, b) => b[1] - a[1]).slice(0, 5),
      aiLevels: Object.entries(aiLevels).sort((a, b) => b[1] - a[1]).slice(0, 5),
      locations: Object.entries(locations).sort((a, b) => b[1] - a[1]).slice(0, 5),
    };
  }, [participants]);

  if (isLoading || participantsLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-8 bg-muted rounded w-16 mb-2" />
                <div className="h-4 bg-muted rounded w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Attendee Stats Header */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-emerald-500/10 to-teal-500/5 border-emerald-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-5 w-5 text-emerald-500" />
              <span className="text-sm font-medium text-muted-foreground">Confirmed Attendees</span>
            </div>
            <p className="text-3xl font-bold text-foreground">
              <CountUp end={metrics.totalUniqueAttendees} duration={600} />
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 to-indigo-500/5 border-blue-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-5 w-5 text-blue-500" />
              <span className="text-sm font-medium text-muted-foreground">Total Attendances</span>
            </div>
            <p className="text-3xl font-bold text-foreground">
              <CountUp end={metrics.totalAttendances} duration={600} />
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-violet-500/5 border-purple-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-5 w-5 text-purple-500" />
              <span className="text-sm font-medium text-muted-foreground">Retention Rate</span>
            </div>
            <p className="text-3xl font-bold text-foreground">
              <CountUp end={metrics.retentionRate} duration={600} />%
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/5 border-amber-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-5 w-5 text-amber-500" />
              <span className="text-sm font-medium text-muted-foreground">Attendance Rate</span>
            </div>
            <p className="text-3xl font-bold text-foreground">
              <CountUp end={metrics.overallAttendanceRate} duration={600} />%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Event and Demographics Tabs */}
      <Tabs defaultValue="by-event" className="w-full">
        <TabsList className="bg-secondary/50 h-auto p-1">
          <TabsTrigger value="by-event" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Calendar className="h-4 w-4" />
            By Event
          </TabsTrigger>
          <TabsTrigger value="by-demographics" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Users className="h-4 w-4" />
            By Demographics
          </TabsTrigger>
          <TabsTrigger value="attendee-list" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Filter className="h-4 w-4" />
            Attendee List
          </TabsTrigger>
        </TabsList>

        {/* By Event Tab */}
        <TabsContent value="by-event" className="mt-4 space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {events.map((event, index) => (
              <Card key={event.eventName} className="hover:border-primary/30 transition-all duration-300">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center justify-between">
                    <span className="truncate">{event.eventName}</span>
                    {event.attendanceRate >= 70 && (
                      <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 text-[10px]">
                        High Turnout
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-2xl font-bold text-emerald-600">{event.totalAttended}</p>
                      <p className="text-xs text-muted-foreground">Attended</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-muted-foreground">{event.totalRegistered}</p>
                      <p className="text-xs text-muted-foreground">Registered</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-border/50">
                    <span className="text-xs text-muted-foreground">Attendance Rate</span>
                    <span className={cn(
                      "text-sm font-semibold",
                      event.attendanceRate >= 70 ? "text-emerald-500" : 
                      event.attendanceRate >= 50 ? "text-amber-500" : "text-red-500"
                    )}>
                      {event.attendanceRate}%
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* By Demographics Tab */}
        <TabsContent value="by-demographics" className="mt-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Age Distribution */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  Age Distribution
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {demographicBreakdown.ageGroups.length > 0 ? (
                  demographicBreakdown.ageGroups.map(([age, count]) => (
                    <div key={age} className="flex items-center justify-between py-1.5 border-b border-border/30 last:border-0">
                      <span className="text-sm">{age}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-secondary rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary rounded-full" 
                            style={{ width: `${(count / metrics.totalUniqueAttendees) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium w-8 text-right">{count}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No age data available</p>
                )}
              </CardContent>
            </Card>

            {/* AI Experience Distribution */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-purple-500" />
                  AI Experience Level
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {demographicBreakdown.aiLevels.length > 0 ? (
                  demographicBreakdown.aiLevels.map(([level, count]) => (
                    <div key={level} className="flex items-center justify-between py-1.5 border-b border-border/30 last:border-0">
                      <span className="text-sm truncate max-w-[150px]">{level}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-secondary rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-purple-500 rounded-full" 
                            style={{ width: `${(count / metrics.totalUniqueAttendees) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium w-8 text-right">{count}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No AI level data available</p>
                )}
              </CardContent>
            </Card>

            {/* Industry Distribution */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-amber-500" />
                  Top Industries
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {demographicBreakdown.industries.length > 0 ? (
                  demographicBreakdown.industries.map(([industry, count]) => (
                    <div key={industry} className="flex items-center justify-between py-1.5 border-b border-border/30 last:border-0">
                      <span className="text-sm truncate max-w-[150px]">{industry}</span>
                      <span className="text-sm font-medium">{count}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No industry data available</p>
                )}
              </CardContent>
            </Card>

            {/* Location Distribution */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-emerald-500" />
                  Top Locations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {demographicBreakdown.locations.length > 0 ? (
                  demographicBreakdown.locations.map(([location, count]) => (
                    <div key={location} className="flex items-center justify-between py-1.5 border-b border-border/30 last:border-0">
                      <span className="text-sm truncate max-w-[150px]">{location}</span>
                      <span className="text-sm font-medium">{count}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No location data available</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Attendee List Tab */}
        <TabsContent value="attendee-list" className="mt-4 space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or company..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={demographicFilter} onValueChange={setDemographicFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Filter by demographic" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Attendees</SelectItem>
                <SelectItem value="age-18-24">Age: 18-24</SelectItem>
                <SelectItem value="age-25-34">Age: 25-34</SelectItem>
                <SelectItem value="age-35-44">Age: 35-44</SelectItem>
                <SelectItem value="age-45+">Age: 45+</SelectItem>
                <SelectItem value="beginner">AI: Beginner</SelectItem>
                <SelectItem value="intermediate">AI: Intermediate</SelectItem>
                <SelectItem value="advanced">AI: Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Results count */}
          <p className="text-sm text-muted-foreground">
            Showing {filteredAttendees.length} attendee{filteredAttendees.length !== 1 ? 's' : ''}
          </p>

          {/* Attendee Cards */}
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {filteredAttendees.slice(0, 30).map((attendee) => (
              <Card 
                key={attendee.id} 
                className="hover:border-primary/30 transition-all cursor-pointer"
                onClick={() => attendee.primary_email && onContactClick?.(attendee.primary_email)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-foreground truncate">
                        {attendee.full_name || 'Unknown'}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {attendee.primary_email || 'No email'}
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {attendee.industry && (
                      <Badge variant="secondary" className="text-[10px]">
                        {attendee.industry}
                      </Badge>
                    )}
                    {attendee.age_range && (
                      <Badge variant="outline" className="text-[10px]">
                        {attendee.age_range}
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredAttendees.length > 30 && (
            <p className="text-center text-sm text-muted-foreground">
              Showing first 30 of {filteredAttendees.length} attendees
            </p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
