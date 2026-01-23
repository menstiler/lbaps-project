const Login = () => {
    const handleSubmit = (e) => {
        e.preventDefault();
        console.log(e.target.email.value, e.target.password.value);
    };
    return (
        <div>
            <h1>Login</h1>
            <form onSubmit={handleSubmit}>
                <input type="email" placeholder="Email" name="email" />
                <input type="password" placeholder="Password" name="password" />
                <button type="submit">Login</button>
            </form>
        </div>
    );
};

export default Login;