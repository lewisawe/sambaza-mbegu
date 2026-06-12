import React from 'react'

export default function SeedDetail({ result }) {
  if (!result) return null

  return (
    <div className="flex items-center gap-6">
      <div>
        <span className="font-[var(--font-chivo-mono)] text-[11px] text-ember-orange uppercase">
          {result.seed?.crop_type}
        </span>
        <h3 className="font-[var(--font-twk-everett)] text-[20px] font-light text-bone-white">
          {result.seed?.local_name}
        </h3>
        <p className="text-[13px] text-fog-light">{result.seed?.name}</p>
      </div>
      <div className="flex gap-6 font-[var(--font-chivo-mono)] text-[12px]">
        <div className="flex flex-col">
          <span className="text-steel-mid text-[10px] uppercase">GROWER</span>
          <span className="text-bone-white">{result.farmer?.name}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-steel-mid text-[10px] uppercase">SINCE</span>
          <span className="text-bone-white">{result.grows_info?.since_year}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-steel-mid text-[10px] uppercase">COUNTY</span>
          <span className="text-bone-white">{result.location?.county}</span>
        </div>
      </div>
    </div>
  )
}
