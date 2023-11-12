import axios from "axios"

const BASE_URL = 'https://api-COUNTRY_CODE.libreview.io/llu'

const getBaseUrl = (countryCode: string): string => {
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
}

export async function getAuthToken(request: LoginAttemptRequest): Promise<string|null> {
  try {
    const response = await axios({
      method: 'post',
      baseURL: getBaseUrl(request.country),
      url: '/auth/login',
      data: {
        email: request.username,
        password: request.password,
      },
      headers: {
        "product": "llu.android",
        "version": "4.7",
        "Pragma": "no-cache",
        "Cache-Control": "no-cache",
        "Accept-Encoding": "gzip",
        "Connection": "keep-alive",
      }
    })

    return response.data?.data?.authTicket?.token
  } catch (error) {
    console.log("Unable to get the token: ", error)
  }

  return null
}

export async function getGraphData(request: GetGeneralRequest): Promise<string|null> {
  try {
    const baseURL = getBaseUrl(request.country)
    const headers = {
      "product": "llu.android",
      "version": "4.7",
      "Pragma": "no-cache",
      "Cache-Control": "no-cache",
      "Accept-Encoding": "gzip",
      "Connection": "keep-alive",
      "Authorization": `Bearer ${request.token}`,
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

    return graphResponse?.data?.data?.connection?.glucoseMeasurement
  } catch (error) {
    console.log("Unable to get the token: ", error)
  }

  return null
}

export async function getConnection(request: GetGeneralRequest): Promise<string|null> {
  try {
    const baseURL = getBaseUrl(request.country)
    const headers = {
      "product": "llu.android",
      "version": "4.7",
      "Pragma": "no-cache",
      "Cache-Control": "no-cache",
      "Accept-Encoding": "gzip",
      "Connection": "keep-alive",
      "Authorization": `Bearer ${request.token}`,
    }

    const response = await axios({
      method: 'get',
      baseURL,
      headers,
      url: '/connections',
    })

    return response?.data?.data[0]
  } catch (error) {
    console.log("Unable to get the token: ", error)
  }

  return null
}

