import { useState, useEffect, useMemo } from "react";
import Papa from "papaparse";

export interface June2025Signup {
  submissionId: string;
  respondentId: string;
  submittedAt: string;
  fullName: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  currentRole: string;
  ageRange: string;
  educationLevel: string;
  aiConfidence: number;
  aiFamiliarity: string;
  workingOnCommunityProject: string;
  aiExcitement: string;
  afterLearningGoal: string;
  aiCaution: string;
  willingToShareProgress: boolean;
  zipCode: string;
  hasDeviceAccess: boolean;
  languages: string;
  racialIdentity: string;
  financialInstability: string;
  householdIncome: string;
  communityConnection: string;
  daysAttending: string;
  tshirtSize: string;
  needsLaptop: boolean;
  accessibilityNeeds: string;
}

export interface June2025Attendance {
  firstName: string;
  lastName: string;
  email: string;
  day1Attendance: boolean;
  day1PostSurvey: boolean;
  day2Attendance: boolean;
  day2PostSurvey: boolean;
  releaseSigned: boolean;
}

function parseJune2025Signup(row: string[]): June2025Signup {
  return {
    submissionId: row[0] || "",
    respondentId: row[1] || "",
    submittedAt: row[2] || "",
    firstName: row[3] || "",
    phone: row[4] || "",
    lastName: row[5] || "",
    email: row[6] || "",
    fullName: row[7] || "",
    currentRole: row[8] || "",
    ageRange: row[9] || "",
    educationLevel: row[10] || "",
    aiConfidence: parseInt(row[11]?.match(/\d/)?.[0] || "0"),
    aiFamiliarity: row[12] || "",
    workingOnCommunityProject: row[13] || "",
    aiExcitement: row[14] || "",
    afterLearningGoal: row[15] || "",
    aiCaution: row[16] || "",
    willingToShareProgress: row[17] === "Yes",
    zipCode: row[18] || "",
    hasDeviceAccess: row[19] === "Yes",
    languages: row[20] || "",
    racialIdentity: row[21] || "",
    financialInstability: row[22] || "",
    householdIncome: row[23] || "",
    communityConnection: row[27] || "",
    daysAttending: row[28] || "",
    tshirtSize: row[29] || "",
    needsLaptop: row[30] === "Yes",
    accessibilityNeeds: row[33] || "",
  };
}

function parseJune2025Attendance(row: Record<string, string>): June2025Attendance {
  return {
    firstName: row["First Name"] || "",
    lastName: row["Last Name"] || "",
    email: row["Email"] || "",
    day1Attendance: row["Day1 Attendance"]?.toLowerCase() === "yes",
    day1PostSurvey: row["Day1 Post Survey"]?.toLowerCase() === "yes",
    day2Attendance: row["Day2 Attendance"]?.toLowerCase() === "yes",
    day2PostSurvey: row["Day2 Post Survey"]?.toLowerCase() === "yes",
    releaseSigned: row["Release Signed"]?.toLowerCase() === "yes",
  };
}

export function useJune2025Event() {
  const [signups, setSignups] = useState<June2025Signup[]>([]);
  const [attendance, setAttendance] = useState<June2025Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [signupResponse, attendanceResponse] = await Promise.all([
          fetch("/aspire-june2025-signup.csv").catch(() => null),
          fetch("/aspire-june2025-attendance.csv").catch(() => null),
        ]);

        // Parse signup data
        if (signupResponse) {
          const signupText = await signupResponse.text();
          Papa.parse(signupText, {
            complete: (result) => {
              const rows = result.data as string[][];
              // Skip header rows (first 3 lines are headers in this format)
              const parsed = rows.slice(3)
                .filter(row => row[0] && row[0].trim() !== "" && row[7])
                .map(parseJune2025Signup);
              setSignups(parsed);
            },
          });
        }

        // Parse attendance data
        if (attendanceResponse) {
          const attendanceText = await attendanceResponse.text();
          Papa.parse(attendanceText, {
            header: true,
            skipEmptyLines: true,
            complete: (result) => {
              const parsed = result.data.map((row: any) => parseJune2025Attendance(row));
              setAttendance(parsed);
            },
          });
        }

        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load June 2025 data");
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Calculate summary stats
  const summary = useMemo(() => {
    const totalSignups = signups.length;
    const totalAttendees = attendance.filter(a => a.day1Attendance || a.day2Attendance).length;
    const day1Attendees = attendance.filter(a => a.day1Attendance).length;
    const day2Attendees = attendance.filter(a => a.day2Attendance).length;
    const bothDaysAttendees = attendance.filter(a => a.day1Attendance && a.day2Attendance).length;
    const completedPostSurvey = attendance.filter(a => a.day1PostSurvey || a.day2PostSurvey).length;
    const signedRelease = attendance.filter(a => a.releaseSigned).length;

    // AI confidence breakdown from signups
    const aiConfidenceLevels = signups.reduce((acc, s) => {
      if (s.aiConfidence >= 1 && s.aiConfidence <= 5) {
        acc[s.aiConfidence] = (acc[s.aiConfidence] || 0) + 1;
      }
      return acc;
    }, {} as Record<number, number>);

    // Role breakdown
    const roleBreakdown = signups.reduce((acc, s) => {
      if (s.currentRole) {
        acc[s.currentRole] = (acc[s.currentRole] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    // Age range breakdown
    const ageBreakdown = signups.reduce((acc, s) => {
      if (s.ageRange) {
        acc[s.ageRange] = (acc[s.ageRange] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    return {
      totalSignups,
      totalAttendees,
      day1Attendees,
      day2Attendees,
      bothDaysAttendees,
      completedPostSurvey,
      signedRelease,
      attendanceRate: totalSignups > 0 ? Math.round((totalAttendees / totalSignups) * 100) : 0,
      aiConfidenceLevels,
      roleBreakdown,
      ageBreakdown,
    };
  }, [signups, attendance]);

  // Create merged contact data for integration
  const mergedContacts = useMemo(() => {
    // Create a map of attendance by name (lowercase for matching)
    const attendanceMap = new Map<string, June2025Attendance>();
    attendance.forEach(a => {
      const key = `${a.firstName.toLowerCase()}_${a.lastName.toLowerCase()}`;
      attendanceMap.set(key, a);
    });

    // Merge signup data with attendance
    return signups.map(signup => {
      const nameKey = `${signup.firstName.toLowerCase() || signup.fullName.split(' ')[0]?.toLowerCase() || ''}_${signup.lastName.toLowerCase() || signup.fullName.split(' ').slice(-1)[0]?.toLowerCase() || ''}`;
      const attendanceData = attendanceMap.get(nameKey);

      return {
        ...signup,
        attended: attendanceData ? (attendanceData.day1Attendance || attendanceData.day2Attendance) : false,
        day1Attended: attendanceData?.day1Attendance || false,
        day2Attended: attendanceData?.day2Attendance || false,
        completedSurvey: attendanceData ? (attendanceData.day1PostSurvey || attendanceData.day2PostSurvey) : false,
      };
    });
  }, [signups, attendance]);

  return {
    signups,
    attendance,
    summary,
    mergedContacts,
    loading,
    error,
  };
}