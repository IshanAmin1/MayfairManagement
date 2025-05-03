import React from "react";

const FacilityInfo = ({ facility }) => {
  return (
    <div className="facility-info">
      <h2>{facility.facilityName}</h2>
      <p>
        <strong>Type:</strong> {facility.facilityType}
      </p>
      <p>
        <strong>Price per Night:</strong> {facility.currency} {facility.pricePerNight}
      </p>
      <p>
        <strong>Max Occupancy:</strong> {facility.maxOccupancy} guests
      </p>
      <p className="description">{facility.description}</p>
    </div>
  );
};

export default FacilityInfo;