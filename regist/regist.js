// 기본 설정
window.onload = function(){
    localStorage.setItem("check",'')
}

const userid = document.getElementById('userid')
userid.addEventListener('input',() => {
    document.getElementById('isUserid').value = 'n'
})

// 아이디 중복 확인
function useridCheck(){
    const userid = document.getElementById('userid')
    const expIdText = /^[A-Za-z0-9]{5,15}$/
    if (!expIdText.test(userid.value)){
        alert('아이디는 5자 이상 15자 이하의 영문자 또는 숫자로 입력하세요')
        userid.focus()
        return false
    }
    const useridData = {userid: userid.value}
    const userid_jsonData = JSON.stringify(useridData)
    fetch('http://localhost:8080/auth/userid_check', {
            method:'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: userid_jsonData
        })
        .then(res => res.json())
        .then(data =>{
            if (data.message == '이 아이디로 등록된 계정이 이미 있습니다'){
                alert('이 아이디로 등록된 계정이 이미 있습니다')
            }else if(data.message == '사용가능한 아이디 입니다'){
                alert('사용가능한 아이디 입니다')
                document.getElementById('isUserid').value = 'y'
            }
        })
}

// 본인인증 팝업창 열기 (아; 근데 앱이면 필요없겠다)
function openPopup(){
    const expNameText = /^(?:[가-힣]{1,20}|[A-Za-z]{1,20})$/
    const expSsn1Text = /^\d{6}$/
    const expSsn2Text = /^\d{7}$/
    const expHpText = /^\d{11}$/

    if (!expNameText.test(document.getElementById('name').value)){
        alert('이름을 올바르게 작성하세요.')
        return false
    }
    else if (!expSsn1Text.test(document.getElementById('ssn1').value)){
        alert('주민등록 번호가 올바르지 않습니다')
        return false
    }
    else if (!expSsn2Text.test(document.getElementById('ssn2').value)){
        alert('주민등록 번호가 올바르지 않습니다')
        return false
    }
    else if (!expHpText.test(document.getElementById('hp').value)){
        alert('하이픈(-)을 제외한 전화번호 11자리를 올바르게 입력하세요')
        return false
    }
    const data = {
        name : document.getElementById('name').value,
        ssn1 : document.getElementById('ssn1').value,
        ssn2 : document.getElementById('ssn2').value,
        hp : document.getElementById('hp').value
    }
    localStorage.setItem("checkInfo",JSON.stringify(data))
    window.open('check.html', '본인인증 페이지', 'width=500, height=600')
}
// 처음으로 돌아가기
function home(){
    window.location.href =  './index.html'
}

// 서버에 회원 정보 보내기 (회원가입 정보 클릭!)
const signUp = document.getElementById('signUp')
signUp.addEventListener('click', async (e)=>{
    e.preventDefault();

    // 입력 정보 추출
    const userid = document.getElementById('userid').value
    const userpw = document.getElementById('userpw').value
    const name = document.getElementById('name').value
    const ssn1 = document.getElementById('ssn1').value
    const ssn2 = document.getElementById('ssn2').value
    const hp = document.getElementById('hp').value
    const fileInput = document.getElementById('fileInput')
    const file = fileInput.files[0]
    
    // 본인인증 했으면 hidden value 'y'로 변경
        selfCheck()
    
        // 정규표현식 확인  // 중복아이디, 본인인증 확인
    if (checkAll() && okUserid()&& okSelf()) {       

        // 데이터 전송  (파일때문에 json이 아닌 FormData()로 전송해야함)
        const formData = new FormData();
        formData.append('userid', userid)
        formData.append('userpw', userpw)
        formData.append('name', name)
        formData.append('ssn1', ssn1)
        formData.append('ssn2', ssn2)
        formData.append('hp', hp)
        formData.append('file', file)
        
        try{
            const response = await fetch('http://localhost:8080/auth/signup', {
                method:'POST',
                body: formData
            })
            if (response.ok) {
                const data = await response.json();
                alert('회원가입 되었습니다.')
                console.log(data);

                // 회원가입이 성공했다면 다음 페이지로 이동
                // window.location.href = '/next-page'; // 변경하고 싶은 URL로 수정
            } else {
                const data = await response.json()
                console.log(data)
                console.error('회원가입 실패');
                alert('회원가입에 실패하였습니다.')
            }
        } catch (error) {
            console.error('에러 발생', error);
        }
    }
})



// 정규 표현식 확인 함수
function checkAll(){
    const userid = document.getElementById('userid')
    const userpw = document.getElementById('userpw')
    const userpw_re = document.getElementById('userpw_re')
    const name = document.getElementById('name')
    const ssn1 = document.getElementById('ssn1')
    const ssn2 = document.getElementById('ssn2')
    const hp = document.getElementById('hp')

    // 정규 표현식
    const expIdText = /^[A-Za-z0-9]{5,15}$/
    const expPwText = /^(?=.*[A-Za-z])(?=.*[~!@#$%^*+=-])(?=.*[0-9])\S{8,15}$/
    const expPw_reText = /^(?=.*[A-Za-z])(?=.*[~!@#$%^*+=-])(?=.*[0-9])\S{8,15}$/
    const expNameText = /^(?:[가-힣]{1,20}|[A-Za-z]{1,20})$/
    const expSsn1Text = /^\d{6}$/
    const expSsn2Text = /^\d{7}$/
    const expHpText = /^\d{11}$/

    // 파일 업로드 되었는지 확인
    const fileInput = document.getElementById('fileInput')
    const file = fileInput.files[0]

    if (!expIdText.test(userid.value)){
        alert('아이디는 5자 이상 15자 이하의 영문자 또는 숫자로 입력하세요')
        userid.focus()
        return false
    }
    else if (!expPwText.test(userpw.value)){
        alert('비밀번호는 5자 이상 20자 이하의 영문자, 숫자, 특수기호(~!@#$%^*+=-)의 조합으로 입력하세요')
        userpw.focus()
        return false
    }
    else if (userpw_re.value !== userpw.value){
        alert('비밀번호가 일치하지 않습니다.')
        userpw_re.focus()
        return false
    }
    else if (!expNameText.test(name.value)){
        alert('이름을 올바르게 작성하세요.')
        name.focus()
        return false
    }
    else if (!expSsn1Text.test(ssn1.value)){
        alert('주민등록 번호가 올바르지 않습니다')
        ssn1.focus()
        return false
    }
    else if (!expSsn2Text.test(ssn2.value)){
        alert('주민등록 번호가 올바르지 않습니다')
        ssn2.focus()
        return false
    }
    else if (!expHpText.test(hp.value)){
        alert('하이픈(-)을 제외한 전화번호 11자리를 올바르게 입력하세요')
        hp.focus()
        return false
    }
    else if (!file){
        alert('파일을 선택하세요')
        return false
    }
    else{
        return true
    }
}

// 본인인증 완료 함수
function selfCheck(){
    const selfCheck = localStorage.getItem('check')
    if (selfCheck == 'ok'){
        document.getElementById('check').value = 'y'
    }
}

// 본인인증 완료했는지 확인하는 함수
function okSelf(){
    const self = document.getElementById('check').value

    // 본인인증 완료했는지 확인
    if (self === 'n'){
        alert('본인인증을 진행해주세요')
        return false
    }
    else{
        return true
    }
}

// 아이디 중복확인 완료했는지 확인하는 함수
function okUserid(){
    const id = document.getElementById('isUserid').value

    // 아이디 중복확인 체크
    if (id === 'n'){
        alert('아이디 중복 확인을 진행해주세요')
        return false
    }else{
        return true
    }
}
