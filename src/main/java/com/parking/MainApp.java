package com.parking;

import com.parking.application.AppConfig;
import com.parking.application.AppContext;
import com.parking.presentation.SceneNavigator;
import com.parking.presentation.ui.LandingView;
import javafx.application.Application;
import javafx.stage.Stage;

public class MainApp extends Application {
    @Override
    public void start(Stage stage) {
        stage.setTitle("Smart Parking Slot Finder");
        AppConfig config = new AppConfig();
        AppContext context = config.buildContext();
        SceneNavigator navigator = new SceneNavigator(stage, context);
        navigator.show(new LandingView(navigator));
        stage.show();
    }

    public static void main(String[] args) {
        launch(args);
    }
}
