import { Inquiry } from '../model/modules/inquiries'

export interface InquiriesRefs {
    inquiriesIncoming?(): FirebaseFirestore.CollectionReference
    inquiriesQueue?(): FirebaseFirestore.CollectionReference
}

export interface InquiriesActions {
    submitInquiry?(input: Inquiry): Promise<void>
}
