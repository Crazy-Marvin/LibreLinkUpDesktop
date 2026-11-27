import axios from 'axios'
import { hash256 } from './utils'

const BASE_URL = 'https://api-COUNTRY_CODE.libreview.io/llu'

const getBaseUrl = (countryCode: string): string => {
  if(countryCode === 'global') {
    return BASE_URL.replace('-COUNTRY_CODE', '')
  }
  return BASE_URL.replace('COUNTRY_CODE', countryCode)
}

type LoginAttemptRequest = {
  country: string
  username: string
  password: string
}

type GetGeneralRequest = {
  token: string
  country: string
  accountId: string
}

export type CgmApiError = {
  error: 'NO_CONNECTIONS' | 'API_ERROR' | 'NETWORK_ERROR' | 'NO_DATA'
  message: string
}

export type CgmConnectionData = {
  glucoseMeasurement?: {
    Timestamp?: string
    FactoryTimestamp?: string
    ValueInMgPerDl?: number
    TrendArrow?: number
  }
  targetLow?: number
  targetHigh?: number
  [key: string]: unknown
}

export type CgmDataResult = CgmConnectionData | CgmApiError | null

export function isCgmApiError(
  data: CgmDataResult,
): data is CgmApiError {
  return data !== null && typeof data === 'object' && 'error' in data
}

export async function getAuthToken(request: LoginAttemptRequest): Promise<{
  token: string, accountId: string, accountCountry: string,
} | { error: number } | null> {
  try {
    let baseUrl = getBaseUrl(request.country);

    let response = await axios({
      method: 'post',
      baseURL: baseUrl,
      url: '/auth/login',
      data: {
        email: request.username,
        password: request.password,
      },
      headers: {
        product: 'llu.android',
        version: '4.16.0',
        Pragma: 'no-cache',
        'Cache-Control': 'no-cache',
        // 'Accept-Encoding': 'gzip',
        // Connection: 'keep-alive',
      },
    });

    if (response.data?.status === 0 ) {
      // Handle different response structures
      let countryCode;
      if (response.data.data.user?.country) {
        // Original structure: {data: {user: {country: "fr"}}}
        countryCode = response.data.data.user.country;
        // if countryCode is ch, set it to eu
        if (countryCode.toLowerCase() === 'ch') {
          countryCode = 'eu';
        }
      } else if (response.data.data.region) {
        // New structure: {data: {region: "fr"}}
        countryCode = response.data.data.region;
      } else {
        // Fallback to original request country
        countryCode = request.country;
      }

      baseUrl = getBaseUrl(countryCode);

      response = await axios({
        method: 'post',
        baseURL: baseUrl,
        url: '/auth/login',
        data: {
          email: request.username,
          password: request.password,
        },
        headers: {
          product: 'llu.android',
          version: '4.16.0',
          Pragma: 'no-cache',
          'Cache-Control': 'no-cache',
        // 'Accept-Encoding': 'gzip',
        // Connection: 'keep-alive',
        },
      });
    }
    else{
      return {
        error: response.data?.status || 999999
      };
    }

    let finalCountryCode = response.data?.data?.user?.country?.toLowerCase();
    finalCountryCode = finalCountryCode === 'ch' ? 'eu' : finalCountryCode;

    return {
      token: response.data?.data?.authTicket?.token,
      accountId: response.data?.data?.user?.id,
      accountCountry: finalCountryCode,
    };
  } catch (error) {
    console.log("Unable to get the token: ", error);
    throw error;
  }

  return null;
}

const getApiErrorMessage = (
  response: { data?: { status?: number; error?: { message?: string }; message?: string } },
  fallback: string,
): string => {
  return (
    response.data?.error?.message ||
    response.data?.message ||
    fallback
  )
}

export async function getCGMData(request: GetGeneralRequest): Promise<CgmDataResult> {
  try {
    const baseURL = getBaseUrl(request.country)
    const headers = {
      product: 'llu.android',
      version: '4.16.0',
      Pragma: 'no-cache',
      'Cache-Control': 'no-cache',
      Authorization: `Bearer ${request.token}`,
      'Account-Id': hash256(request.accountId),
    }

    const connResponse = await axios({
      method: 'get',
      baseURL,
      headers,
      url: '/connections',
    })

    if (connResponse.data?.status !== undefined && connResponse.data.status !== 0) {
      return {
        error: 'API_ERROR',
        message: getApiErrorMessage(
          connResponse,
          'Unable to fetch LibreLinkUp connections.',
        ),
      }
    }

    const patientId = connResponse.data?.data[0]?.patientId

    if (!patientId) {
      if (connResponse.data?.data?.length === 0) {
        return { error: 'NO_CONNECTIONS', message: 'No LibreLinkUp connections found. Please set up a connection in your Libre app.' }
      }
      return {
        error: 'NO_DATA',
        message: 'No patient connection found in LibreLinkUp response.',
      }
    }

    const graphResponse = await axios({
      method: 'get',
      baseURL,
      headers,
      url: `/connections/${patientId}/graph`,
    })

    if (graphResponse.data?.status !== undefined && graphResponse.data.status !== 0) {
      return {
        error: 'API_ERROR',
        message: getApiErrorMessage(
          graphResponse,
          'Unable to fetch glucose data from LibreLinkUp.',
        ),
      }
    }

    const connection = graphResponse?.data?.data?.connection
    if (!connection) {
      return {
        error: 'NO_DATA',
        message: 'LibreLinkUp returned no glucose connection data.',
      }
    }

    return connection
  } catch (error: any) {
    console.log('Unable to getCGMData: ', error)
    const message =
      error?.response?.data?.error?.message ||
      error?.response?.data?.message ||
      (error?.message
        ? `Network error: ${error.message}`
        : 'Failed to load glucose data. Please check your connection.')

    return {
      error: 'NETWORK_ERROR',
      message,
    }
  }
}

export async function getConnection(request: GetGeneralRequest): Promise<string|null> {
  try {
    const baseURL = getBaseUrl(request.country)
    const headers = {
      product: 'llu.android',
      version: '4.16.0',
      Pragma: 'no-cache',
      'Cache-Control': 'no-cache',
      Authorization: `Bearer ${request.token}`,
      'Account-Id': hash256(request.accountId),
    }

    const response = await axios({
      method: 'get',
      baseURL,
      headers,
      url: '/connections',
    })

    return response?.data?.data[0]
  } catch (error: any) {
    console.log('Unable to getConnection: ', error)
  }

  return null
}
