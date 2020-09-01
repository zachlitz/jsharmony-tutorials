import { XForm } from '../../../jsh-core/xForm';
import { Customer } from '../../../domain/customer';
import { CustomerNote } from '../../../domain/customerNote';


export class CustomerNotesData {

    private readonly _xForm: XForm;

    public constructor(xForm: XForm) {
        this._xForm = xForm;
    }

    /**
     * @throws
     */
    public async createNote(request: CreateNoteRequest): Promise<number> {
        const data = {
            note_scope_id: request.customerId,
            note_scope: 'C',
            note_type: 'U',
            note_sts: 'A',
            note_body: request.noteBody
        }
        const endpoint = 'jsHarmonyFactory/Note';
        return (await this.put<{note_id: number}>(endpoint, {}, data)).note_id;
    }

    /**
     * @throws
     */
    public async deleteNote(request: DeleteNoteRequest): Promise<void> {
        const query = {
            note_id: request.noteId
        };
        const endpoint = 'jsHarmonyFactory/Note';
        return this.delete(endpoint, query, {}).then(() => undefined);
    }

    /**
     * @throws
     */
    public async getCustomers(): Promise<Customer[]> {
        const endpoint = 'CustomerNotes_Get_Cust';
        return (await this.post<[Customer[], any[]]>(endpoint, {}, {}))[0];
    }

    /**
     * @throws
     */
    public async getNote(request: GetNoteRequest): Promise<CustomerNote | undefined> {
        const data = {
            note_scope: "C",
            note_id: request.noteId,
            note_type:"U"
        }
        const query = {
            d: JSON.stringify(data),
            rowstart: 0,
            rowcount: 0,
            sort: '["vnote_etstmp"]',
            searchjson: '',
            search: '',
            _: Date.now()
        };

        const endpoint = 'jsHarmonyFactory/Note_User_Listing';
        const response = await this.get<CustomerNote[]>(endpoint, query, data) ?? [];
        return response[0];
    }

    /**
     * @throws
     */
    public async getNotes(request: GetNotesRequest): Promise<CustomerNote[]> {
        const data = {
            note_scope: "C",
            note_scope_id: request.customerId,
            note_type:"U"
        }
        const query = {
            d: JSON.stringify(data),
            rowstart: 0,
            rowcount: 0,
            sort: '["vnote_etstmp"]',
            searchjson: '',
            search: '',
            _: Date.now()
        };

        const endpoint = 'jsHarmonyFactory/Note_User_Listing';
        return this.get<CustomerNote[]>(endpoint, query, data);
    }

    /**
     * @throws
     */
    public async updateNote(request: UpdateNoteRequest): Promise<void> {
        const data = {
            note_body: request.noteBody
        };
        const query = {
            note_id: request.noteId
        };
        const endpoint = 'jsHarmonyFactory/Note';
        return this.post(endpoint, query, data).then(() => undefined);
    }

    /**
     * @throws
     */
    private async delete<T extends object>(endpoint: string, query: object, data: object): Promise<T> {
        const response = await this._xForm.reqDelete(endpoint, query, data, undefined);
        return this.handleApiResponse(response, endpoint) as T;
    }

    /**
     * @throws
     */
    private async get<T extends object>(endpoint: string, query: object, data: object): Promise<T> {
        const response = await this._xForm.reqGet(endpoint, query, data, undefined);
        return this.handleApiResponse(response, endpoint) as T;
    }

    /**
     * @throws
     */
    private handleApiResponse(response: any, endpoint: string): any {
        if (response == undefined) {
            throw new Error(`Response not defined for ${endpoint}`);
        }
        if ('_success' in response) {
            return response[endpoint];
        } else {
            throw new Error(`Data request was not successful. Unknown error for ${endpoint}`);
        }
    }

    /**
     * @throws
     */
    private async post<T extends object>(endpoint: string, query: object, data: object): Promise<T> {
        const response = await this._xForm.reqPost(endpoint, query, data, undefined);
        return this.handleApiResponse(response, endpoint) as T;
    }

    /**
     * @throws
     */
    private async put<T extends object>(endpoint: string, query: object, data: object): Promise<T> {
        const response = await this._xForm.reqPut(endpoint, query, data, undefined);
        return this.handleApiResponse(response, endpoint) as T;
    }
}

export interface CreateNoteRequest {
    customerId: number;
    noteBody: string;
}

export interface DeleteNoteRequest {
    noteId: number;
}

export interface GetNoteRequest {
    noteId: number;
}

export interface GetNotesRequest {
    customerId: number;
}

export interface UpdateNoteRequest {
    noteId: number;
    noteBody: string;
}