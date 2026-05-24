package com.parking.presentation.ui;

import com.parking.domain.model.Role;
import com.parking.presentation.SceneNavigator;

public class UserLoginView extends RoleLoginView {
    public UserLoginView(SceneNavigator navigator) {
        super(
                navigator,
                "User Login",
                "👤",
                "Enter your username",
                "Enter your password",
                "← Back to Home",
                "Create Account →",
                () -> navigator.show(new RegistrationView(navigator)),
                true
        );
    }

    @Override
    protected boolean matchesRole(Role role) {
        return role == Role.USER;
    }

    @Override
    protected void openDashboard() {
        navigator().show(new UserDashboardView(navigator()));
    }
}
