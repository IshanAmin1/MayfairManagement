import React from "react";

const FacilityInfo = ({ facility }) => {
  return (
    <div className="facility-info">
      <h2>{facility.facilityName}</h2>
      <p>
      </p>
      <p>
        <strong>Max Occupancy:</strong> {facility.maxOccupancy} guests
      </p>
      <p className="description">{facility.description}</p>
    </div>
  );
};

export default FacilityInfo;