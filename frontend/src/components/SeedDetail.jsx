import React from 'react'

export default function SeedDetail({ result }) {
  if (!result) return null

  return (
    <div className="seed-detail">
      <div className="seed-detail__header">
        <span className="seed-detail__crop">{result.seed?.crop_type}</span>
        <h3 className="seed-detail__local">{result.seed?.local_name}</h3>
        <p className="seed-detail__name">{result.seed?.name}</p>
      </div>
      <div className="seed-detail__meta">
        <div className="seed-detail__tag">
          <span className="seed-detail__label">Grower</span>
          <span>{result.farmer?.name}</span>
        </div>
        <div className="seed-detail__tag">
          <span className="seed-detail__label">Since</span>
          <span>{result.grows_info?.since_year}</span>
        </div>
        <div className="seed-detail__tag">
          <span className="seed-detail__label">Location</span>
          <span>{result.location?.county}</span>
        </div>
      </div>
    </div>
  )
}
