import { useState, useEffect, useMemo } from "react";
import Papa from "papaparse";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Search, Filter } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

type Row = Record<string, string>;

interface Person {
  name: string;
  email: string;
  phone: string;
  source: string;
  role: string;
  age: string;
  race: string;
  eventsRegistered: string[];
  eventsAttended: string[];
}

async function loadCSV(path: string): Promise<Row[]> {
  try {
    const resp = await fetch(path);
    if (!resp.ok) return [];
    const text = await resp.text();
    return Papa.parse<Row>(text, { header: true, skipEmptyLines: true }).data;
  } catch { return []; }
}

function findField(rows: Row[], ...candidates: string[]): string {
  if (!rows[0]) return candidates[0] || "";
  const headers = Object.keys(rows[0]);
  for (const c of candidates) {
    const match = headers.find(h => h.trim().toLowerCase() === c.toLowerCase());
    if (match) return match;
  }
  return candidates[0] || "";
}

export function PeopleDashboard() {
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [eventFilter, setEventFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    async function load() {
      try {
        const [juneSignup, septSignup, decSignup, juneAtt1, juneAtt2, septAtt, decAtt] = await Promise.all([
          loadCSV("/signups/june-aspire-signup.csv"),
          loadCSV("/signups/sept27-signup.csv"),
          loadCSV("/signups/dec6-registration.csv"),
          loadCSV("/attendance/june-aspire-day1.csv"),
          loadCSV("/attendance/june-aspire-day2.csv"),
          loadCSV("/attendance/sept27-attendance.csv"),
          loadCSV("/attendance/dec6-attendance.csv"),
        ]);

        // Build attendance lookup sets
        const juneAttNames = new Set<string>();
        [...juneAtt1, ...juneAtt2].forEach(r => {
          const vals = Object.values(r);
          const fn = (r["First Name"] || vals[0] || "").toLowerCase().trim();
          const ln = (r["Last Name"] || vals[1] || "").toLowerCase().trim();
          if (fn || ln) juneAttNames.add(`${fn}_${ln}`);
        });

        const septAttEmails = new Set<string>();
        septAtt.filter(r => parseInt(r["Total check-ins"] || "0") >= 1).forEach(r => {
          const e = (r["Email"] || "").toLowerCase().trim();
          if (e) septAttEmails.add(e);
        });

        const decAttEmails = new Set<string>();
        decAtt.filter(r => parseInt(r["Total check-ins"] || "0") >= 1).forEach(r => {
          const e = (r["Email"] || "").toLowerCase().trim();
          if (e) decAttEmails.add(e);
        });

        // Merge all registrants by email
        const personMap = new Map<string, Person>();

        function addPerson(row: Row, source: string, emailField: string, firstField: string, lastField: string, roleField: string, ageField: string, raceField: string) {
          const email = (row[emailField] || "").toLowerCase().trim();
          const first = (row[firstField] || "").trim();
          const last = (row[lastField] || "").trim();
          const name = `${first} ${last}`.trim();
          const key = email || name.toLowerCase();
          if (!key) return;

          const existing = personMap.get(key);
          if (existing) {
            if (!existing.eventsRegistered.includes(source)) existing.eventsRegistered.push(source);
          } else {
            personMap.set(key, {
              name,
              email,
              phone: (row[findField([row], "Phone", "phone", "Phone Number")] || "").trim(),
              source,
              role: (row[roleField] || "").trim(),
              age: (row[ageField] || "").trim(),
              race: (row[raceField] || "").trim(),
              eventsRegistered: [source],
              eventsAttended: [],
            });
          }
        }

        // Process June signups
        const jFirstF = findField(juneSignup, "First Name");
        const jLastF = findField(juneSignup, "Last Name");
        const jEmailF = findField(juneSignup, "What's your email?", "Email");
        const jRoleF = findField(juneSignup, "What Best Describes Your Current Role?");
        const jAgeF = findField(juneSignup, "What is your age range?");
        const jRaceF = findField(juneSignup, "What's Your Racial Identity?");
        juneSignup.forEach(r => addPerson(r, "June ASPIRE", jEmailF, jFirstF, jLastF, jRoleF, jAgeF, jRaceF));

        // Process Sept signups
        const sFirstF = findField(septSignup, "First Name");
        const sLastF = findField(septSignup, "Last Name");
        const sEmailF = findField(septSignup, "What's your email?", "Email");
        const sRoleF = findField(septSignup, "What best describes your current role?");
        const sAgeF = findField(septSignup, "What is your age range?");
        septSignup.forEach(r => addPerson(r, "Sept Build Day", sEmailF, sFirstF, sLastF, sRoleF, sAgeF, ""));

        // Process Dec signups
        const dFirstF = findField(decSignup, "First Name");
        const dLastF = findField(decSignup, "Last Name");
        const dEmailF = findField(decSignup, "What's your email?", "Email");
        const dRoleF = findField(decSignup, "What best describes your current role?");
        const dAgeF = findField(decSignup, "What is your age range?");
        const dRaceF = findField(decSignup, "What's your racial identity?");
        decSignup.forEach(r => addPerson(r, "Dec Workshop", dEmailF, dFirstF, dLastF, dRoleF, dAgeF, dRaceF));

        // Cross-reference attendance
        personMap.forEach((person) => {
          // June: name match
          const nameParts = person.name.toLowerCase().split(" ");
          const fn = nameParts[0] || "";
          const ln = nameParts.slice(1).join(" ");
          if (person.eventsRegistered.includes("June ASPIRE") && juneAttNames.has(`${fn}_${ln}`)) {
            person.eventsAttended.push("June ASPIRE");
          }
          // Sept: email match
          if (person.eventsRegistered.includes("Sept Build Day") && person.email && septAttEmails.has(person.email)) {
            person.eventsAttended.push("Sept Build Day");
          }
          // Dec: email match
          if (person.eventsRegistered.includes("Dec Workshop") && person.email && decAttEmails.has(person.email)) {
            person.eventsAttended.push("Dec Workshop");
          }
        });

        setPeople(Array.from(personMap.values()));
      } catch (err) {
        console.error("Failed to load people data:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = useMemo(() => {
    let result = people;

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.email.toLowerCase().includes(q) ||
        p.role.toLowerCase().includes(q)
      );
    }

    if (eventFilter !== "all") {
      result = result.filter(p => p.eventsRegistered.includes(eventFilter));
    }

    if (statusFilter === "attended") {
      result = result.filter(p => p.eventsAttended.length > 0);
    } else if (statusFilter === "no-show") {
      result = result.filter(p => p.eventsAttended.length === 0);
    }

    return result;
  }, [people, search, eventFilter, statusFilter]);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{people.length}</p>
                <p className="text-sm text-muted-foreground">Total People</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-emerald-500/5 to-emerald-500/10 border-emerald-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-500/10">
                <Users className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{people.filter(p => p.eventsAttended.length > 0).length}</p>
                <p className="text-sm text-muted-foreground">Confirmed Attendees</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-amber-500/5 to-amber-500/10 border-amber-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-500/10">
                <Users className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{people.filter(p => p.eventsAttended.length === 0).length}</p>
                <p className="text-sm text-muted-foreground">No-Shows</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or role..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={eventFilter} onValueChange={setEventFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Event" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Events</SelectItem>
                <SelectItem value="June ASPIRE">June ASPIRE</SelectItem>
                <SelectItem value="Sept Build Day">Sept Build Day</SelectItem>
                <SelectItem value="Dec Workshop">Dec Workshop</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="attended">Attended</SelectItem>
                <SelectItem value="no-show">No-Show</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Showing {filtered.length} of {people.length} people
          </p>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="max-h-[600px] overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="hidden md:table-cell">Role</TableHead>
                  <TableHead className="hidden lg:table-cell">Age</TableHead>
                  <TableHead>Registered</TableHead>
                  <TableHead>Attended</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.slice(0, 200).map((person, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-medium">{person.name || "—"}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{person.email || "—"}</TableCell>
                    <TableCell className="hidden md:table-cell text-sm">{person.role || "—"}</TableCell>
                    <TableCell className="hidden lg:table-cell text-sm">{person.age || "—"}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {person.eventsRegistered.map(e => (
                          <Badge key={e} variant="outline" className="text-xs">{e}</Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {person.eventsAttended.length > 0 ? (
                          person.eventsAttended.map(e => (
                            <Badge key={e} className="text-xs bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30">{e}</Badge>
                          ))
                        ) : (
                          <Badge variant="secondary" className="text-xs">No-show</Badge>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {filtered.length > 200 && (
            <p className="text-xs text-muted-foreground text-center py-3">
              Showing first 200 of {filtered.length} results
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
