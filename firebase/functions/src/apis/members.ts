import fetch, { RequestInit } from 'node-fetch'

enum Method {
    POST = "POST",
    GET = "GET",
}

interface Church {
    org: {
        churchID: number
        name: string
        visitingAddress: {
            country: {
                iso2Code: 'no',
                nameEn: 'Norway',
            },
        }
    },
}

export interface Person {
    birthDate: string
    firstName: string
    lastName: string
    displayName: string
    churchId: number
    guardianID: number
    lastChangedDate: string
    profilePicture: string | null
    middleName: string | null
    personID: number
    secondGuardianID: number | null
    related: {
        children: Array<Person>,
        spouse: Array<Person>,
    },
        church: Church,
}

interface PersonListResponse {
    total: number
    limit: number
    skip: number
    data: Array<Person>
}

export default class MembersAPI {
    apiKey: string;
    baseUrl = "https://members.bcc.no/"

    constructor(key: string) {
        this.apiKey = key
    }

    public async getPerson(personId: string) : Promise<Person|null> {
        const personsList = await this.doRequest<PersonListResponse>(Method.GET, `person?personID=${personId}`)
        if (personsList.total !== 1) {
            return null
        }

        return personsList.data[0]
    }

    private async doRequest<T>(method: Method, url: string, body: Record<string, unknown> | null = null)  : Promise<T> {
        const params : RequestInit = {
            method,
            headers: {
                'Content-Type': 'application/json',
                'x-access-token': this.apiKey,
            },
        }

        if (method === Method.POST) {
            params.body = JSON.stringify(body)
        }

        const res = await fetch(`${this.baseUrl}/${url}`, params)
        if (!res.ok) {
            console.log(await res.text())
        }
        return (await res.json()) as T
    }
}
