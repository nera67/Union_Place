const feedbackBtn = document.getElementById('feedback-btn')
const inputs = document.getElementsByTagName('input')
const info = document.getElementById('info')

feedbackBtn.onclick = async function() {
    const form = document.getElementById('feedback__form')
    const feedbackInfo = {
        fio: form.fio.value,
        phone: form.phone.value,
        email: form.email.value,
        info: form.info.value
    }
    const feedbackInfoJSON = JSON.stringify(feedbackInfo)
    
    const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: feedbackInfoJSON
    })
    if (response.ok) {
        for (let i = 0; i < 3; i++) {
            inputs.item(i).value = ""
        }
        info.value = ""
        new Toast({
                title: false,
                text: 'Заявка оставлена',
                theme: 'info',
                autohide: true,
                interval: 5000
        })
        console.log(inputs)
        console.log(await response.json())
    }
}