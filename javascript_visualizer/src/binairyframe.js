/**
 * @return {string}
 */
export function ArrayBufferToString (buffer) {
  return BinaryToString(String.fromCharCode.apply(null, Array.prototype.slice.apply(new Uint8Array(buffer))))
}

export function StringToArrayBuffer (string) {
  return StringToUint8Array(string).buffer
}

/**
 * @return {string}
 */
function BinaryToString (binary) {
  var error

  try {
    return decodeURIComponent(escape(binary))
  } catch (_error) {
    error = _error
    if (error instanceof URIError) {
      return binary
    } else {
      throw error
    }
  }
}

/**
 * @return {string}
 */
function StringToBinary (string) {
  var chars, code, i, isUCS2, len, _i

  len = string.length
  chars = []
  isUCS2 = false
  for (i = _i = 0; len >= 0 ? _i < len : _i > len; i = len >= 0 ? ++_i : --_i) {
    code = String.prototype.charCodeAt.call(string, i)
    if (code > 255) {
      isUCS2 = true
      chars = null
      break
    } else {
      chars.push(code)
    }
  }
  if (isUCS2 === true) {
    return unescape(encodeURIComponent(string))
  } else {
    return String.fromCharCode.apply(null, Array.prototype.slice.apply(chars))
  }
}

function StringToUint8Array (string) {
  var binary, binLen, buffer, chars, i, _i
  binary = StringToBinary(string)
  binLen = binary.length
  buffer = new ArrayBuffer(binLen)
  chars = new Uint8Array(buffer)
  for (i = _i = 0; binLen >= 0 ? _i < binLen : _i > binLen; i = binLen >= 0 ? ++_i : --_i) {
    chars[i] = String.prototype.charCodeAt.call(binary, i)
  }
  return chars
}
