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
} | null> {
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
        version: '4.12.0',
        Pragma: 'no-cache',
        'Cache-Control': 'no-cache',
        // 'Accept-Encoding': 'gzip',
        // Connection: 'keep-alive',
      },
    });

    if (response.data?.status === 0 && response.data?.data?.redirect) {
      baseUrl = getBaseUrl(response.data.data.region);

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
          version: '4.12.0',
          Pragma: 'no-cache',
          'Cache-Control': 'no-cache',
        // 'Accept-Encoding': 'gzip',
        // Connection: 'keep-alive',
        },
      });
    }
    else{
      return {
        success: false,
        error: response.data?.status || 999999
      };
    }

    return {
      token: response.data?.data?.authTicket?.token,
      accountId: response.data?.data?.user?.id,
      accountCountry: response.data?.data?.user?.country?.toLowerCase(),
    };
  } catch (error) {
    console.log("Unable to get the token: ", error);
  }

  return null;
}

export async function getCGMData(request: GetGeneralRequest): Promise<string|null> {
  try {
    const baseURL = getBaseUrl(request.country)
    const headers = {
      product: 'llu.android',
      version: '4.12.0',
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
      console.log("Unable to get the patient id")
      return null
    }

    const graphResponse = await axios({
      method: 'get',
      baseURL,
      headers,
      url: `/connections/${patientId}/graph`,
    })

    console.log(graphResponse?.data?.data)

    return graphResponse?.data?.data?.connection
  } catch (error) {
    console.log('Unable to getCGMData: ', error)
  }

  return null
}

export async function getConnection(request: GetGeneralRequest): Promise<string|null> {
  try {
    const baseURL = getBaseUrl(request.country)
    const headers = {
      product: 'llu.android',
      version: '4.12.0',
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
  } catch (error) {
    console.log('Unable to getConnection: ', error)
  }

  return null
}
