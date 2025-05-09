import React from 'react'
import PropTypes from 'prop-types'

function LanguagesPreview({ resumeInfo }) {
  if (!resumeInfo?.languages?.length) return null

  const color = resumeInfo.themeColor || '#000'

  return (
    <div className="my-6">
      <h2
        className="text-center font-bold text-sm mb-2"
        style={{ color }}
      >
        Languages
      </h2>
      <hr style={{ borderColor: color }} />

      <div className="grid grid-cols-1 gap-2 my-4">
        {resumeInfo.languages.map((language, index) => (
          <div
            key={index}
            className="w-full text-xs flex items-center justify-between"
          >
            <h3 className="font-bold text-sm" style={{ color }}>
              {language.languageName}
            </h3>

            {/* linia punctată între limbă și nivel */}
            <div className="flex-1 mx-2 relative">
              <div
                className="absolute inset-0"
                style={{
                  top: '50%',
                  height: '2px',
                  backgroundImage: `repeating-linear-gradient(
                    to right,
                    ${color} 0px,
                    ${color} 1px,
                    transparent 1px,
                    transparent 8px
                  )`,
                  transform: 'translateY(-50%)',
                }}
              />
            </div>

            <span className="whitespace-nowrap" style={{ color }}>
              {language.proficiencyLevel}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

LanguagesPreview.propTypes = {
  resumeInfo: PropTypes.shape({
    themeColor: PropTypes.string,
    languages: PropTypes.arrayOf(
      PropTypes.shape({
        languageName: PropTypes.string,
        proficiencyLevel: PropTypes.string,
      })
    ),
  }),
}

export default LanguagesPreview
