import { useQueryStates } from 'nuqs'
import {
  createSearchParamsCache,
  createSerializer,
  parseAsString,
} from 'nuqs/server'

export const callbackUrlParsers = {
  callbackUrl: parseAsString.withDefault(""),
}

export const callbackUrlKeys = {
  callbackUrl: 'callbackUrl',
}

export const callbackUrlSearchParamsCache = createSearchParamsCache(callbackUrlParsers, { urlKeys: callbackUrlKeys })
export const serializeCallbackUrl = createSerializer(callbackUrlParsers, { urlKeys: callbackUrlKeys })

export function useCallbackUrl() {
  const [{ callbackUrl }, setQueryStates] = useQueryStates(callbackUrlParsers, { urlKeys: callbackUrlKeys })

  function setCallbackUrl(value: string | null) {
    setQueryStates({ callbackUrl: value })
  }

  return { callbackUrl, setCallbackUrl }
}