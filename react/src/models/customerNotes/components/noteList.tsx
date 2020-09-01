import React from 'react';
import './noteList.less';
import { NoteListItem } from './noteListItem';
import { CustomerNotesData } from '../data/customerNotesData';
import { CustomerNote } from '../../../domain/customerNote';
import { XExt } from '../../../jsh-core/xExt';

export class NoteList extends React.Component<Props, State> {

    private readonly _customerNotesData: CustomerNotesData;
    private _isMounted: boolean = false;
    private _lastItemElement: HTMLDivElement | null | undefined;

    public constructor(props: Props) {
        super(props);
        this.state = {};
        this._customerNotesData = props.customerNotesData;
    }

    public componentDidMount(): void {
        this._isMounted = true;
        this.scrollToLastItem();
    }

    public componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<State>, snapshot: any): void {
        if (this.props.notes !== prevProps.notes) {
            const lastLength = prevProps.notes?.length ?? 0;
            const newLength = this.props.notes?.length ?? 0;
            if (newLength > lastLength) {
                this.scrollToLastItem();
            }
        }
    }

    public componentWillUnmount(): void {
        this._isMounted = false;
    }

    public render(): React.ReactNode {

        const notes = this.props.notes ?? [];

        const enableAddButton = (this.state.newNoteBody ?? '').length > 0 &&
            this.props.customerId != undefined;

        this._lastItemElement = undefined;

        const noteItems = notes.map((note, index, arr) => {
            const isLast = index === arr.length - 1;
            return (
                <div key={note.note_id} className="noteItemWrapper" ref={el => { if (isLast) this._lastItemElement = el }}>
                    <NoteListItem note={note}
                                  customerNotesData={this.props.customerNotesData}
                                  xExt={this.props.xExt}
                                  noteDeleted={noteId => this.onNoteDeleted(noteId)}
                                  noteUpdated={updatedNote => this.onNoteUpdated(updatedNote)}></NoteListItem>
                </div>
            );
        });

        const emptyListMessage = this.props.loadingNotes ? '' : 'This customer does not have any notes';

        return (
            <div className="NoteListComponent">
                <div className="verticalWrapper">
                    <div className="noteList">
                        {
                            notes.length < 1 ? <div>{emptyListMessage}</div> : noteItems
                        }
                    </div>
                    <div className="newNote">
                        <textarea value={this.state.newNoteBody} onChange={e => this.onChangeNewNote(e.target.value)} ></textarea>
                        <button disabled={!enableAddButton} onClick={() => this.onClickAdd()}>Add</button>
                    </div>
                </div>
            </div>
        );
    }

    private onChangeNewNote(value: string): void {
        this.setState({ newNoteBody: value });
    }

    private async onClickAdd(): Promise<void> {
        const noteBody = this.state.newNoteBody ?? '';
        const customerId = this.props.customerId;
        if (noteBody.length < 1 || customerId == undefined) {
            return;
        }

        let newNoteId: number | undefined;

        try {
            newNoteId = await this._customerNotesData.createNote({
                customerId,
                noteBody
            });
            if (!this._isMounted) return;
            this.setState({ newNoteBody: '' });
        } catch (error) {
            if (!this._isMounted) return;
        } finally {
            if (!this._isMounted) return;
        }

        if (newNoteId == undefined) {
            return;
        }

        try {
            const newNote = await this._customerNotesData.getNote({ noteId: newNoteId });
            if (!this._isMounted) return;

            if (newNote == undefined) {

            } else {
                this.props.addNewNote(newNote, customerId);
            }

        } catch (error) {

        }
    }

    private onNoteDeleted(noteId: number): void {
        const notes = [...(this.props.notes ?? [])];
        const index = notes.findIndex(a => a.note_id === noteId);
        if (index < 0) {
            return;
        }
        notes.splice(index, 1)
        this.props.notesUpdated(notes);
    }

    private onNoteUpdated(note: CustomerNote): void {
        const notes = [...(this.props.notes ?? [])];
        const index = notes.findIndex(a => a.note_id === note.note_id);
        if (index < 0) {
            return;
        }
        notes[index] = note;
        this.props.notesUpdated(notes);
    }

    private scrollToLastItem(): void {
        if (this._lastItemElement != undefined) {
            this._lastItemElement.scrollIntoView();
        }
    }
}

export interface Props {
    addNewNote(note: CustomerNote, customerId: number): void;
    customerId: number | undefined;
    customerNotesData: CustomerNotesData;
    loadingNotes: boolean;
    notes: CustomerNote[] | undefined;
    notesUpdated(notes: CustomerNote[]): void;
    xExt: XExt;
}

export interface State {
    newNoteBody?: string;
}