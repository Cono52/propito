const fuzz = require('fuzzball')

const isSamePropertyDescription = (description1, description2) => {
  if (fuzz.token_set_ratio(description1, description2) >= 95) {
    return true
  }
  return false
}

const deduplicateProperties = properties => {
  const unqiue = []
  for (let i = 0; i < properties.length; i++) {
    for (let j = i + 1; j < properties.length; j++) {
      if (properties[i] === 'duplicate') break
      if (isSamePropertyDescription(properties[i].desc, properties[j].desc)) {
        properties[j] = 'duplicate'
      }
    }
    if (properties[i] !== 'duplicate') {
      unqiue.push(properties[i])
    }
  }
  return unqiue
}

module.exports = deduplicateProperties
