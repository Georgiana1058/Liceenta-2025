import React from 'react'
import PropTypes from 'prop-types'

function VolunteeringPreview({ resumeInfo }) {
  if (!resumeInfo?.volunteering?.length) return null

  return (
    <div className="my-6">
      <h2 className="text-center font-bold text-sm mb-2" style={{ color: resumeInfo?.themeColor }}>
        Volunteering Experience
      </h2>
      <hr style={{ borderColor: resumeInfo?.themeColor }} />
      {resumeInfo.volunteering.map((item, idx) => (
        <div key={idx} className="my-5">
          <h3 className="text-sm font-bold" style={{ color: resumeInfo?.themeColor }}>
            {item.title}
          </h3>
          <p className="text-xs my-2">{item.description}</p>
        </div>
      ))}
    </div>
  )
}

VolunteeringPreview.propTypes = {
  resumeInfo: PropTypes.shape({
    themeColor: PropTypes.string,
    volunteering: PropTypes.arrayOf(
      PropTypes.shape({
        title: PropTypes.string,
        description: PropTypes.string
      })
    )
  })
}

export default VolunteeringPreview
