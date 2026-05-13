package com.parking;

import com.parking.application.AppConfig;
import com.parking.application.AppContext;
import com.parking.presentation.SceneNavigator;
import com.parking.presentation.ui.LoginView;
import javafx.application.Application;
import javafx.stage.Stage;

public class MainApp extends Application {
    @Override
    public void start(Stage stage) {
        AppConfig config = new AppConfig();
        AppContext context = config.buildContext();

        stage.setTitle("Smart Parking Slot Finder");
        SceneNavigator navigator = new SceneNavigator(stage, context);
        navigator.show(new LoginView(navigator));
        stage.show();
    }

    public static void main(String[] args) {
        launch(args);
    }
}
