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

export async function getCGMData(request: GetGeneralRequest): Promise<string|null|{error: string, message: string}> {
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

    const patientId = connResponse.data?.data[0]?.patientId

    if (!patientId) {
      if (connResponse.data?.data?.length === 0) {
        return { error: 'NO_CONNECTIONS', message: 'No LibreLinkUp connections found. Please set up a connection in your Libre app.' }
      }
      return null
    }

    const graphResponse = await axios({
      method: 'get',
      baseURL,
      headers,
      url: `/connections/${patientId}/graph`,
    })

    return graphResponse?.data?.data?.connection
  } catch (error: any) {
    console.log('Unable to getCGMData: ', error)
  }

  return null
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
