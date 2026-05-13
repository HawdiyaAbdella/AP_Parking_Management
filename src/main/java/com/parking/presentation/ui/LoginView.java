package com.parking.presentation.ui;

import com.parking.domain.model.Role;
import com.parking.domain.model.User;
import com.parking.presentation.SceneNavigator;
import com.parking.presentation.View;
import javafx.geometry.Insets;
import javafx.geometry.Pos;
import javafx.scene.Scene;
import javafx.scene.control.Button;
import javafx.scene.control.Label;
import javafx.scene.control.PasswordField;
import javafx.scene.control.TextField;
import javafx.scene.layout.VBox;

public class LoginView implements View {
    private final SceneNavigator navigator;

    public LoginView(SceneNavigator navigator) {
        this.navigator = navigator;
    }

    @Override
    public Scene buildScene() {
        Label title = new Label("Smart Parking Management");
        title.setStyle("-fx-font-size: 22; -fx-font-weight: bold;");

        TextField username = new TextField();
        username.setPromptText("Username");

        PasswordField password = new PasswordField();
        password.setPromptText("Password");

        Label feedback = new Label();
        feedback.setStyle("-fx-text-fill: #b00020;");

        Button loginButton = new Button("Login");
        loginButton.setMaxWidth(Double.MAX_VALUE);
        loginButton.setOnAction(event -> {
            try {
                User user = navigator.context().authUseCase()
                        .login(username.getText(), password.getText())
                        .orElse(null);

                if (user == null) {
                    feedback.setText("Invalid username or password");
                    return;
                }

                navigator.context().setCurrentUser(user);
                if (user.role() == Role.ADMIN) {
                    navigator.show(new AdminDashboardView(navigator));
                } else {
                    navigator.show(new UserDashboardView(navigator));
                }
            } catch (Exception e) {
                feedback.setText("Login failed: " + e.getMessage());
            }
        });

        VBox root = new VBox(12, title, username, password, loginButton, feedback);
        root.setPadding(new Insets(40));
        root.setAlignment(Pos.CENTER);
        root.setMaxWidth(380);

        VBox wrapper = new VBox(root);
        wrapper.setAlignment(Pos.CENTER);
        return new Scene(wrapper, 900, 600);
    }
}
