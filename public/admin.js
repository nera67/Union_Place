const root = document.getElementById('root')
const domain = 'http://localhost:3000'

const loginPage = /* html */ `
<div class="login__container">
	<form class="login-form" onsubmit="loginSubmit(event)">
		<label for="login">Логин</label><input type="text" id="login" name="login">
		<label for="password">Пароль</label><input type="password" id="password" name="password">
		<button type="submit" class="btn login-btn">Войти</button>
	</form>
</div>`

function ordersPage(orders = []) {
	return /* html */`
		<table class="table">
			<thead>
				<tr>
					<th>ID</th>
					<th>FIO</th>
					<th>Phone</th>
					<th>Email</th>
					<th>Info</th>
				</tr>
			</thead>
			<tbody>
				${orders.map(order => {
					return /* html */`
					<tr>
						<td>${order.id}</td>
						<td>${order.fio}</td>
						<td>${order.phone}</td>
						<td>${order.email}</td>
						<td>${order.info}</td>
					</tr>`
				}).join('')}
			</tbody>
		</table>`
} 

root.innerHTML = loginPage

async function loginSubmit(event) {
	event.preventDefault()
	const form = event.target
	const loginValue = form.login.value
	const passwordValue = form.password.value

	const response = await fetch(`${domain}/api/login`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			name: loginValue,
			password: passwordValue
		})
	})
	if (response.ok) {
		const tokenInfo = await response.json()
		localStorage.setItem('Token', tokenInfo.token)
		renderOrders()
	}
}

async function renderOrders() {
	const token = localStorage.getItem('Token')
	if (token) {
		const response = await fetch(`${domain}/api/feedback`, {
			headers: {
				'Authorization': token
			}
		})
		if (response.ok) {
			const orders = await response.json()
			root.innerHTML = ordersPage(orders)
		} else {
			root.innerHTML = loginPage
		}
	} else {
		root.innerHTML = loginPage
	}
}
