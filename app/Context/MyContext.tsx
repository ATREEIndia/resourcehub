'use client'
import { onAuthStateChanged, User } from "firebase/auth"
import { createContext, ReactNode, useContext, useEffect, useState } from "react"
import { auth, db, m_firestore } from "../Components/MyFirebase"
import { collectionGroup, doc, DocumentData, onSnapshot, query, setDoc, snapshotEqual, updateDoc } from "firebase/firestore"
import { onValue, ref } from "firebase/database"

type contextProbs = {
    user: User | null
    loading: boolean
    dbData: any[]
    userFirestoreData: DocumentData | null
    fcData: any[]
}
type fcType = {
    id: string,
    assets: string,
}

const myContext = createContext<contextProbs | undefined>(undefined)

export const MyContextProvider = ({ children }: { children: ReactNode }) => {
    const [loggedInUser, setLoggedInUser] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [dbSnapshotData, setDbSnapshotData] = useState<any[]>([])
    const [fcData, setFcData] = useState<fcType[]>([])
    const [userFirestoreData, setUserFirestoreData] = useState<DocumentData | null>(null)




    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                if (!user.email?.includes('@atree.org')) {
                    setLoggedInUser(null)
                    alert('Please use ATREE Email ID')
                    return

                }
                setLoggedInUser(user)
                addUserToFirestore(user)
            } else {
                setLoggedInUser(null)
            }
            setIsLoading(false)

        })
        return () => unsubscribe();

    }, [])


    const addUserToFirestore = async (user: User) => {
        if (!user.email) return;
        try {
            const firestoreRef = doc(m_firestore, "users", user.email)
            await setDoc(firestoreRef, {
                name: user.displayName,
                profileUrl: user.photoURL,
                email: user.email
            }, { merge: true })
        } catch (error) {
            console.log(error)
        }
    }


    useEffect(() => {
        const dbref = ref(db, "/")
        const unsubscribe = onValue(dbref, (snapshot) => {
            const data = snapshot.val()
            const imgDataArray = data.Images ? Object.values(data.Images) : []
            const videoDataArray = data.Videos ? Object.values(data.Videos) : []
            const allData = [...imgDataArray, ...videoDataArray]
            setDbSnapshotData(allData)

        })

        return () => unsubscribe()

    }, [])

    // featured collections
    useEffect(() => {
        const firestoreRef = query(collectionGroup(m_firestore, 'fc'));

        const unSubscribe = onSnapshot(firestoreRef, (snapshot) => {
            // Use a try-catch or careful mapping to avoid ReferenceErrors
            const snapshotData = snapshot.docs.map((doc) => {
                const data = doc.data();

                const access = data.access || '';
                const accessArray=access.split(',')
                console.log('Access: ' + accessArray)

                if (access.length>2 && !accessArray.some((a:string)=>a===loggedInUser?.email)) {
                    return null; // Mark for filtering
                }




                // Safety check: Use doc.id if data.id is missing
                return {
                    id: data?.id || doc.id,
                    assets: data?.assets || ""
                };
            }).filter((item) => item !== null);

            setFcData(snapshotData as fcType[]);
        }, (error) => {
            console.error("Firestore Snapshot Error:", error);
        });

        return () => unSubscribe();
    }, [loggedInUser]);



    //user firestore data

    useEffect(() => {
        if (!loggedInUser?.email) return;

        const userRef = doc(m_firestore, 'users', loggedInUser.email)

        const unsubscribe = onSnapshot(userRef, (snapshot) => {
            if (snapshot.exists()) {
                setUserFirestoreData(snapshot.data())
            }

            setIsLoading(false);

        })

        return () => unsubscribe()


    }, [loggedInUser])

    const values = {
        user: loggedInUser,
        loading: isLoading,
        userFirestoreData: userFirestoreData,
        dbData: dbSnapshotData,
        fcData: fcData
    }

    return (
        <myContext.Provider value={values}>
            {children}

        </myContext.Provider>
    )

}

export const useMyContext = () => {
    const context = useContext(myContext)
    if (!context) {
        throw new Error('context not found')
    }
    return context
}
