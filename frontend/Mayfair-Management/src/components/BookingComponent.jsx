import React, { useEffect, useState } from "react";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";

import FacilityCard from "./FacilityDetails/FacilityCard";
import "./BookingComponent.css";

const BookingComponent = ({ currentUser }) => {
  const [selectedDates, setSelectedDates] = useState({
    date: null,
    startTime: "09:00",
    endTime: "17:00",
  });
  const [currentDate, setCurrentDate] = useState(new Date());
  const [filteredFacilities, setFilteredFacilities] = useState([]);
  const [isFiltered, setIsFiltered] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loggedInUser, setLoggedInUser] = useState(currentUser);
  const [facilityData, setFacilityData] = useState([]);

  useEffect(() => {
    async function fetchFacilityData() {
      try {
        const response = await fetch(
          "http://127.0.0.1:8000/facilities/",
          {
            method: "GET",
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch facility data.");
        }

        const data = await response.json();
        console.log("Fetching successful:", data);
        setFacilityData(data);
      } catch (error) {
        console.error("Error during fetch:", error);
      }
    }
    fetchFacilityData();
  }, []);

  const handleDateClick = (day, monthOffset = 0) => {
    const selectedDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + monthOffset,
      day
    );
    setSelectedDates({
      date: selectedDate,
      startTime: "09:00",
      endTime: "17:00",
    });
    setError("");
  };

  const handleTimeChange = (e, type) => {
    setSelectedDates({
      ...selectedDates,
      [type]: e.target.value,
    });
    setError("");
  };

  const handleMonthChange = (increment) => {
    const newDate = new Date(
      currentDate.setMonth(currentDate.getMonth() + increment)
    );
    setCurrentDate(new Date(newDate));
  };

  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInCurrentMonth = new Date(year, month + 1, 0).getDate();
    const startOfMonth = new Date(year, month, 1).getDay();
    const daysInPreviousMonth = new Date(year, month, 0).getDate();

    const days = [];

    for (let i = startOfMonth - 1; i >= 0; i--) {
      days.push({ day: daysInPreviousMonth - i, monthOffset: -1 });
    }

    for (let i = 1; i <= daysInCurrentMonth; i++) {
      days.push({ day: i, monthOffset: 0 });
    }

    const remainingSlots = 42 - days.length;
    for (let i = 1; i <= remainingSlots; i++) {
      days.push({ day: i, monthOffset: 1 });
    }

    return days;
  };

  const isDateSelected = (day, monthOffset) => {
    const date = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + monthOffset,
      day
    );
    return selectedDates.date && selectedDates.date.getTime() === date.getTime();
  };

  const days = generateCalendarDays();

  const handleFilterFacilities = () => {
    if (!selectedDates.date) {
      setError("Please select a date.");
      setIsFiltered(false);
      return;
    }

    if (!selectedDates.startTime || !selectedDates.endTime) {
      setError("Please select start and end times.");
      setIsFiltered(false);
      return;
    }

    const startDateTime = new Date(selectedDates.date);
    const [startHours, startMinutes] = selectedDates.startTime.split(":");
    startDateTime.setHours(startHours, startMinutes);

    const endDateTime = new Date(selectedDates.date);
    const [endHours, endMinutes] = selectedDates.endTime.split(":");
    endDateTime.setHours(endHours, endMinutes);

    if (endDateTime <= startDateTime) {
      setError("End time must be after start time.");
      setIsFiltered(false);
      return;
    }

    const isTimeSlotAvailable = (occupiedDate, occupiedStartTime, occupiedEndTime) => {
      const occupied = new Date(occupiedDate);
      occupied.setHours(0, 0, 0, 0);

      if (occupied.getTime() !== selectedDates.date.getTime()) {
        return true; // Different day, no conflict
      }

      const occupiedStart = new Date(occupiedDate);
      const [occStartHours, occStartMinutes] = occupiedStartTime.split(":");
      occupiedStart.setHours(occStartHours, occStartMinutes);

      const occupiedEnd = new Date(occupiedDate);
      const [occEndHours, occEndMinutes] = occupiedEndTime.split(":");
      occupiedEnd.setHours(occEndHours, occEndMinutes);

      return (
        endDateTime <= occupiedStart || startDateTime >= occupiedEnd
      );
    };

    console.log("Facility Data:", facilityData);
    // Assuming facility.occupiedDates includes time data like { date, startTime, endTime }
    const availableFacilities = facilityData.filter((facility) =>
      facility.occupiedDates.every((occ) =>
        isTimeSlotAvailable(occ.date, occ.startTime || "00:00", occ.endTime || "23:59")
      )
    );

    setFilteredFacilities(availableFacilities);
    setIsFiltered(true);
    setError("");
  };

  return (
    <div className="booking-container">
      <div className="calendar-header">
        <button className="date-switcher" onClick={() => handleMonthChange(-1)}>
          <FaArrowLeft></FaArrowLeft>
        </button>
        <h2>
          {currentDate.toLocaleString("default", {
            month: "long",
            year: "numeric",
          })}
        </h2>
        <button className="date-switcher" onClick={() => handleMonthChange(1)}>
          <FaArrowRight></FaArrowRight>
        </button>
      </div>

      <div className="calendar-days">
        {days.map(({ day, monthOffset }, index) => (
          <div
            key={index}
            className={`calendar-day ${
              isDateSelected(day, monthOffset) ? "selected" : ""
            } ${monthOffset !== 0 ? "overflow" : ""}`}
            onClick={() => handleDateClick(day, monthOffset)}
          >
            {day}
          </div>
        ))}
      </div>

      <div className="time-selection">
        <label>
          Start Time:
          <input
            type="time"
            value={selectedDates.startTime}
            onChange={(e) => handleTimeChange(e, "startTime")}
            required
          />
        </label>
        <label>
          End Time:
          <input
            type="time"
            value={selectedDates.endTime}
            onChange={(e) => handleTimeChange(e, "endTime")}
            required
          />
        </label>
      </div>

      <button className="book-facilities-button" onClick={handleFilterFacilities}>
        Book Facility
      </button>

      {error && <div className="error-message">{error}</div>}

      <div className="filtered-facilities">
        {filteredFacilities.length > 0 ? (
          filteredFacilities.map((facility) => (
            <FacilityCard
              onBookingSuccess={() => {
                setSelectedDates({
                  date: null,
                  startTime: "09:00",
                  endTime: "17:00",
                });
                setFilteredFacilities([]);
                setSuccess("Booking Successful!");
                setTimeout(() => {
                  setSuccess("");
                  setError("");
                }, 5000);
              }}
              key={facility.id}
              facility={facility}
              selectedDateRange={selectedDates}
            />
          ))
        ) : isFiltered && selectedDates.date ? (
          <p>No available facility for the selected date and time.</p>
        ) : success ? (
          <p>{success}</p>
        ) : error ? (
          <p>{error}</p>
        ) : (
          <p>Please select a date and time for booking.</p>
        )}
      </div>
    </div>
  );  
};

export default BookingComponent;