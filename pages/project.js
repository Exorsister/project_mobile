const RB = ReactBootstrap;
const { Alert, Card, Button, Table } = ReactBootstrap;


const firebaseConfig = {
    apiKey: "AIzaSyBLDez3MsdYRnoZGXr1kvBefYfV5MGzsFM",
    authDomain: "projectmobile-797e9.firebaseapp.com",
    projectId: "projectmobile-797e9",
    storageBucket: "projectmobile-797e9.appspot.com",
    messagingSenderId: "512174301237",
    appId: "1:512174301237:web:1a624082ce2f8345cfd17c",
    measurementId: "G-51WW5SW7BN"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();

class App extends React.Component {

    title = (
        <Alert variant="info">
            <b>Work6 :</b> Firebase
        </Alert>
    );
    footer = (
        <div>
            แก้เหมือนทำตอนบ่ายหน่อย ไม่ได้เซฟไว้ <br />
            College of Computing, Khon Kaen University
        </div>
    );
    state = {
        scene: 0,
        students: [],
        id: "",
        stdname: "",
        stdemail: "",
        stdsection: "",
        showMessage: false,
        isLoggedIn: false,
    }

    readData() {
        db.collection("students").get().then((querySnapshot) => {
            var stdlist = [];
            querySnapshot.forEach((doc) => {
                stdlist.push({ id: doc.id, ...doc.data() });
            });
            console.log(stdlist);
            this.setState({ students: stdlist });
        });
    }

    autoRead() {
        db.collection("students").onSnapshot((querySnapshot) => {
            var stdlist = [];
            querySnapshot.forEach((doc) => {
                stdlist.push({ id: doc.id, ...doc.data() });
            });
            this.setState({ students: stdlist });
        });
    }

    insertData() {
        db.collection("students").doc(this.state.stdid).set({
            title: this.state.stdtitle,
            fname: this.state.stdfname,
            lname: this.state.stdlname,
            phone: this.state.stdphone,
            email: this.state.stdemail,
        });

        this.setState({
            stdid: "",
            stdname: "",
            stdemail: "",
            stdsection: "",
            showMessage: true,
        });

        setTimeout(() => {
            this.setState({
                showMessage: false,
            });
        }, 3000);
    }

    edit(std) {
        this.setState({
            stdid: std.stdid,
            stdname: std.stdname,
            stdemail: std.stdemail,
            stdsection: std.stdsection,
        })
    }

    delete(std) {
        if (confirm("ต้องการลบข้อมูล")) {
            db.collection("students").doc(std.id).delete();
        }
    }

    loginWithGoogle() {
        const provider = new firebase.auth.GoogleAuthProvider();
        auth.signInWithPopup(provider)
            .then((result) => {
                // เข้าสู่ระบบสำเร็จ
                console.log("Login successful", result);
                // ดึงข้อมูลผู้ใช้
                const user = result.user;
                // ตั้งค่า isLoggedIn เป็น true เมื่อเข้าสู่ระบบสำเร็จ
                this.setState({ isLoggedIn: true });
                // แสดงอีเมลของผู้ใช้
                console.log("User email:", user.email);
                // อาจทำการ setState เพื่อเก็บข้อมูลผู้ใช้ไว้สำหรับการแสดงในแอพ
                // ตัวอย่างเช่น
                this.setState({ userEmail: user.email });
            })
            .catch((error) => {
                // เกิดข้อผิดพลาดในการเข้าสู่ระบบ
                console.error("Login error", error);
            });
    }

    render() { 
        return (
            <Card>
                <Card.Header>{this.title}</Card.Header>
                <Card.Body>
                    {!this.state.isLoggedIn && (
                        <Button onClick={() => this.loginWithGoogle()}>เข้าสู่ระบบด้วย Google</Button>
                    )}
                    <Button onClick={() => this.readData()}>Read Data</Button>
                    <Button onClick={() => this.autoRead()}>Auto Read</Button>
                    {this.state.userEmail && <div>User Email: {this.state.userEmail}</div>}
                    <div>
                        <StudentTable data={this.state.students} app={this} />
                    </div>
                </Card.Body>
                <Card.Footer>
                    <b>เพิ่ม/แก้ไขข้อมูล นักศึกษา :</b><br />
                    <TextInput label="ID" app={this} value="stdid" style={{ width: 120 }} />
                    <TextInput label="ชื่อ" app={this} value="stdname" style={{ width: 120 }} />
                    <TextInput label="Email" app={this} value="stdemail" style={{ width: 150 }} />
                    <TextInput label="Phone" app={this} value="stdsection" style={{ width: 120 }} />
                    <Button onClick={() => this.insertData()}>Save</Button>

                    {/* แสดงข้อความเมื่อ showMessage เป็น true */}
                    {this.state.showMessage && <Alert variant="success">บันทึกสำเร็จ!</Alert>}
                </Card.Footer>
                <Card.Footer>{this.footer}</Card.Footer>
            </Card>
        );
    }
}

function StudentTable({ data, app }) {
    var rows = [];
    for (var s of data) {
        rows.push(
            <tr key={s.id}>
                <td>{s.id}</td>
                <td>{s.name}</td>
                <td>{s.email}</td>
                <td>{s.section}</td>
                <td><EditButton std={s} app={app} /></td>
                <td><DeleteButton std={s} app={app} /></td>
            </tr>
        );
    }
    return (
        <table className='table'>
            <thead>
                <tr>
                    <th>รหัส</th>
                    <th>ชื่อ</th>
                    <th>email</th>
                    <th>section</th>
                    <th></th>
                    <th></th>
                </tr>
            </thead>
            <tbody>
                {rows}
            </tbody>
        </table>
    );
}

function TextInput({ label, app, value, style }) {
    return <label className="form-label">
        {label}:
        <input className="form-control" style={style}
            value={app.state[value]} onChange={(ev) => {
                var s = {};
                s[value] = ev.target.value;
                app.setState(s)
            }
            }></input>
    </label>;
}

function EditButton({ std, app }) {
    return <button onClick={() => app.edit(std)}>แก้ไข</button>
}
function DeleteButton({ std, app }) {
    return <button onClick={() => app.delete(std)}>ลบ</button>
}


const container = document.getElementById("myapp");
const root = ReactDOM.createRoot(container);
root.render(<App />);