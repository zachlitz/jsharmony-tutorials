import React from 'react';
import './noteListItem.less';
import { CustomerNotesData } from '../data/customerNotesData';
import { SvgIcons } from './svgIcons';
import { CustomerNote } from '../../../domain/customerNote';
import { XExt } from '../../../jsh-core/xExt';

export class NoteListItem extends React.Component<Props, State> {

    private readonly _customerNotesData: CustomerNotesData;
    private _isMounted: boolean = false;
    private readonly _xExt: XExt;

    public constructor(props: Props) {
        super(props);
        this._customerNotesData = props.customerNotesData;
        this._xExt = props.xExt;
        this.state = {
            inEditMode: false
        };
    }

    public componentDidMount(): void {
        this._isMounted = true;
    }

    public componentWillUnmount(): void {
        this._isMounted = false;
    }

    public render(): React.ReactNode {

        const note = this.props.note;
        const toolbarHiddenClass = this.state.showToolbar ? 'on' : '';

        let body: React.ReactNode;
        if (this.state.inEditMode) {
            body = (
                <div>
                    <textarea value={this.state.editedText} onChange={e => this.onChangeBody(e.target.value)}></textarea>
                    <div>
                        <button onClick={() => this.onClickSave()}>Save</button>
                        <button onClick={() => this.onClickCancel()}>Cancel</button>
                    </div>
                </div>
            );
        } else {
            body = <pre>{note.note_body}</pre>;
        }

        return (
            <div className="NoteListItemComponent">
                <div onMouseEnter={() => this.onMouseOver(true)} onMouseLeave={() => this.onMouseOver(false)}>
                    <div className="header">
                        <div className="info">
                            <div className="author">{note.note_euser_fmt}</div>
                            <div className="timestamp">{this.createTimestamp(note.note_etstmp)}</div>
                        </div>
                        <div className={`toolbar ${toolbarHiddenClass}`}>
                            <button onClick={() => this.onClickEdit()} dangerouslySetInnerHTML={{ __html: SvgIcons.edit}}></button>
                            <button onClick={() => this.onClickDelete()} dangerouslySetInnerHTML={{ __html: SvgIcons.delete}}></button>
                        </div>
                    </div>
                    <div className="body">
                        {body}
                    </div>
                </div>
            </div>
        );
    }

    private createTimestamp(time: number): string {
        const date = new Date(time);
        const today = new Date();
        const isToday = date.getDate() === today.getDate();
        let timestamp: string;

        // If the time is from today
        // then don't show the date (only the time).
        if (isToday) {
            timestamp = date.toLocaleTimeString();
        } else {
            timestamp = `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
        }

        // Remove seconds
        return timestamp.replace(/(\d{1,2}):(\d{1,2}):\d{1,2}/, '$1:$2');
    }

    private onChangeBody(value: string): void {
        this.setState({ editedText: value });
    }

    private onClickCancel(): void {
        this.setState({
            inEditMode: false,
            editedText: undefined
        });
    }

    private onClickDelete(): void {

        const confirmDelete = async () => {
            if (!this._isMounted) return;
            this.setState({ deletingText: true });

            try {
                await this._customerNotesData.deleteNote({ noteId: this.props.note.note_id });
                if (!this._isMounted) return;
                this.props.noteDeleted(this.props.note.note_id);
            } catch (error) {
                console.error(error);
            } finally {
                if (!this._isMounted) return;
                this.setState({ deletingText: false });
            }
        };

        this._xExt.confirm('Delete item permanently?', confirmDelete, () => {}, {});
    }

    private onClickEdit(): void {
        this.setState({
            editedText: this.props.note.note_body,
            inEditMode: true
        });
    }

    private async onClickSave(): Promise<void> {

        this.setState({ savingText: true });
        const text = this.state.editedText ?? '';
        try {
            await this._customerNotesData.updateNote({
                noteBody: text,
                noteId: this.props.note.note_id
            });
            if (!this._isMounted) return;
            const note = Object.assign({}, this.props.note);
            note.note_body = text;
            this.props.noteUpdated(note);

            this.setState({
                editedText: '',
                inEditMode: false
            });
        } catch (error) {
            console.error(error);
        } finally {
            if (!this._isMounted) return;
            this.setState({ savingText: false });
        }
    }

    private onMouseOver(isOver: boolean): void {
        this.setState({ showToolbar: isOver });
    }
}

export interface Props {
    customerNotesData: CustomerNotesData;
    note: CustomerNote;
    noteDeleted(noteId: number): void;
    noteUpdated(note: CustomerNote): void;
    xExt: XExt;
}

export interface State {
    deletingText?: boolean;
    editedText?: string;
    inEditMode: boolean;
    savingText?: boolean;
    showToolbar?: boolean;
}