import React, { useState, useEffect, useContext } from "react";
import "./OccupiedDatesDisplay.css";
import { UserContext } from "./UserContext";

const OccupiedDatesDisplay = () => {
  const [groupedDates, setGroupedDates] = useState({});
  const { user, setUser } = useContext(UserContext);

  useEffect(() => {
    console.log(user);
    if (!user) {
      return;
    }

    const baseURL = "http://127.0.0.1:8000";
    async function fetchDates() {
      try {
        const response = await fetch(`${baseURL}/occupied-dates/`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${user.token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Fetch failed");
        }
        console.log(user.token);
        const data = await response.json();
        console.log(data);
        return data;
      } catch (error) {
        console.error("Error during fetching dates:", error);
        return [];
      }
    }

    async function processAndSetDates() {
      const fetchedDates = await fetchDates();

      // Process dates and times into grouped ranges
      const processDates = (dates) => {
        // Ensure dates are sorted chronologically
        const sortedDates = dates.sort((a, b) => {
          const dateA = new Date(`${a.date}T${a.start_time}`);
          const dateB = new Date(`${b.date}T${b.start_time}`);
          return dateA - dateB;
        });

        const ranges = {};
        let currentMonth = "";
        let currentRange = null;

        sortedDates.forEach((entry) => {
          const { date: dateStr, start_time, end_time } = entry;
          // Parse the date and time
          const dateTime = new Date(`${dateStr}T${start_time}`);
          if (isNaN(dateTime.getTime())) {
            console.error("Invalid date or time:", dateStr, start_time);
            return; // Skip invalid entries
          }

          const month = dateTime.toLocaleString("en-US", {
            month: "long",
            year: "numeric",
          });

          if (month !== currentMonth) {
            // If month changes, finalize the previous range
            if (currentRange) {
              if (!ranges[currentMonth]) ranges[currentMonth] = [];
              ranges[currentMonth].push(currentRange);
            }
            currentMonth = month;
            currentRange = {
              startDate: dateStr,
              startTime: start_time,
              endDate: dateStr,
              endTime: end_time,
            };
          } else {
            // Check if the date is consecutive
            const prevDate = new Date(`${currentRange.endDate}T${currentRange.endTime}`);
            prevDate.setDate(prevDate.getDate() + 1); // Add 1 day to check continuity

            const currentDate = new Date(`${dateStr}T${start_time}`);
            if (
              currentDate.toISOString().split("T")[0] ===
              prevDate.toISOString().split("T")[0]
            ) {
              // Extend the current range
              currentRange.endDate = dateStr;
              currentRange.endTime = end_time;
            } else {
              // Finalize the current range and start a new one
              if (!ranges[currentMonth]) ranges[currentMonth] = [];
              ranges[currentMonth].push(currentRange);
              currentRange = {
                startDate: dateStr,
                startTime: start_time,
                endDate: dateStr,
                endTime: end_time,
              };
            }
          }
        });

        // Finalize the last range
        if (currentRange) {
          if (!ranges[currentMonth]) ranges[currentMonth] = [];
          ranges[currentMonth].push(currentRange);
        }

        return ranges;
      };

      setGroupedDates(processDates(fetchedDates));
    }

    processAndSetDates();
  }, [user]);

  return (
    <div className="occupied-dates-container">
      {Object.keys(groupedDates).map((month) => (
        <div key={month} className="month-section">
          <h2 className="month-title">{month}</h2>
          <div className="date-cards">
            {groupedDates[month].map((range, index) => (
              <div key={index} className="date-card">
                <p className="date-range">
                  {new Date(`${range.startDate}T${range.startTime}`).toLocaleString("en-US", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })} -{" "}
                  {new Date(`${range.endDate}T${range.endTime}`).toLocaleString("en-US", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default OccupiedDatesDisplay;