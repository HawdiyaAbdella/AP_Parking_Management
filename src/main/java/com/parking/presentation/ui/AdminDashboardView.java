package com.parking.presentation.ui;

import com.parking.domain.model.ParkingSlot;
import com.parking.domain.model.Reservation;
import com.parking.domain.model.ReservationStatus;
import com.parking.domain.model.SlotStatus;
import com.parking.presentation.SceneNavigator;
import com.parking.presentation.View;
import javafx.beans.property.ObjectProperty;
import javafx.beans.property.SimpleObjectProperty;
import javafx.geometry.Insets;
import javafx.geometry.Pos;
import javafx.scene.Node;
import javafx.scene.Scene;
import javafx.scene.control.Button;
import javafx.scene.control.DatePicker;
import javafx.scene.control.Label;
import javafx.scene.control.ListView;
import javafx.scene.control.ScrollPane;
import javafx.scene.control.TextField;
import javafx.scene.control.ComboBox;
import javafx.scene.layout.BorderPane;
import javafx.scene.layout.ColumnConstraints;
import javafx.scene.layout.GridPane;
import javafx.scene.layout.HBox;
import javafx.scene.layout.Priority;
import javafx.scene.layout.Region;
import javafx.scene.layout.StackPane;
import javafx.scene.layout.VBox;
import javafx.scene.control.ScrollPane.ScrollBarPolicy;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

public class AdminDashboardView implements View {
    private enum Section {
        DASHBOARD("Dashboard"),
        ADD_VEHICLE("Add Vehicle"),
        CATEGORIES("Categories"),
        ADD_CATEGORY("Add Category"),
        MANAGE("Manage"),
        MANAGE_VEHICLES("Manage Vehicles"),
        INCOMING("Incoming"),
        OUTGOING("Outgoing"),
        REPORTS("Reports"),
        BY_DATE_RANGE("By Date Range"),
        SEARCH_VEHICLE("Search Vehicle"),
        PARKING_SEATS("Parking Seats"),
        USER_MEMBERSHIP("User Membership");

        private final String label;

        Section(String label) {
            this.label = label;
        }

        public String label() {
            return label;
        }
    }

    private static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");
    private final SceneNavigator navigator;
    private final ObjectProperty<Section> activeSection = new SimpleObjectProperty<>(Section.DASHBOARD);
    private final Map<Section, Button> sidebarButtons = new EnumMap<>(Section.class);
    private StackPane contentHost;
    private Label sectionTitleLabel;

    public AdminDashboardView(SceneNavigator navigator) {
        this.navigator = navigator;
    }

    @Override
    public Scene buildScene() {
        BorderPane root = new BorderPane();
        root.setStyle("-fx-background-color: #f5f7fb;");

        root.setLeft(buildSidebar());
        root.setCenter(buildMainArea());

        showSection(Section.DASHBOARD);
        return new Scene(root, 1600, 900);
    }

    private Node buildSidebar() {
        VBox sidebar = new VBox(18);
        sidebar.setPrefWidth(260);
        sidebar.setPadding(new Insets(24, 18, 24, 18));
        sidebar.setStyle("-fx-background-color: #111827;");

        HBox brandRow = new HBox(12);
        brandRow.setAlignment(Pos.CENTER_LEFT);

        Label logo = new Label("🚗");
        logo.setStyle("-fx-font-size: 24; -fx-text-fill: white;");

        VBox brandText = new VBox(2);
        Label brand = new Label("VPMS");
        brand.setStyle("-fx-text-fill: white; -fx-font-size: 20; -fx-font-weight: 700;");
        Label brandSub = new Label("Admin Panel");
        brandSub.setStyle("-fx-text-fill: #cbd5e1; -fx-font-size: 11;");
        brandText.getChildren().addAll(brand, brandSub);
        brandRow.getChildren().addAll(logo, brandText);

        VBox navGroup = new VBox(8);
        navGroup.getChildren().addAll(
                createSidebarButton(Section.DASHBOARD, "🏠 Dashboard"),
                createSidebarButton(Section.ADD_VEHICLE, "➕ Add Vehicle"),
                createSidebarButton(Section.CATEGORIES, "🏷 Categories"),
                createSidebarButton(Section.ADD_CATEGORY, "＋ Add Category"),
                createSidebarButton(Section.MANAGE, "📋 Manage"),
                createSidebarButton(Section.MANAGE_VEHICLES, "🚙 Manage Vehicles"),
                createSidebarButton(Section.INCOMING, "↩ Incoming"),
                createSidebarButton(Section.OUTGOING, "↪ Outgoing"),
                createSidebarButton(Section.REPORTS, "📊 Reports"),
                createSidebarButton(Section.BY_DATE_RANGE, "📅 By Date Range"),
                createSidebarButton(Section.SEARCH_VEHICLE, "🔎 Search Vehicle"),
                createSidebarButton(Section.PARKING_SEATS, "🅿 Parking Seats"),
                createSidebarButton(Section.USER_MEMBERSHIP, "👥 User Membership")
        );

        Region spacer = new Region();
        VBox.setVgrow(spacer, Priority.ALWAYS);

        Button logout = new Button("⏻ Logout");
        logout.setMaxWidth(Double.MAX_VALUE);
        logout.setPrefHeight(42);
        logout.setStyle(sidebarButtonStyle(false, true));
        logout.setOnAction(e -> {
            navigator.context().logout();
            navigator.show(new LoginView(navigator));
        });

        sidebar.getChildren().addAll(brandRow, navGroup, spacer, logout);
        return sidebar;
    }

    private Node buildMainArea() {
        VBox main = new VBox(18);
        main.setPadding(new Insets(22));
        main.setStyle("-fx-background-color: #f5f7fb;");

        sectionTitleLabel = new Label();
        sectionTitleLabel.setStyle("-fx-font-size: 28; -fx-font-weight: 700; -fx-text-fill: #111827;");

        Label subtitle = new Label("Welcome back, " + navigator.context().currentUser().username() + " — here is your parking overview.");
        subtitle.setStyle("-fx-text-fill: #6b7280; -fx-font-size: 14;");

        VBox titleBlock = new VBox(4, sectionTitleLabel, subtitle);

        Label profileChip = new Label("👤 " + navigator.context().currentUser().username());
        profileChip.setStyle("-fx-background-color: white; -fx-background-radius: 18; -fx-padding: 10 16 10 16; -fx-text-fill: #111827; -fx-border-color: #e5e7eb; -fx-border-radius: 18;");

        Button miniLogout = new Button("Logout");
        miniLogout.setStyle("-fx-background-color: transparent; -fx-text-fill: #ef4444; -fx-font-weight: 700;");
        miniLogout.setOnAction(e -> {
            navigator.context().logout();
            navigator.show(new LoginView(navigator));
        });

        HBox topBar = new HBox(12, titleBlock, new Region(), profileChip, miniLogout);
        HBox.setHgrow(topBar.getChildren().get(1), Priority.ALWAYS);
        topBar.setAlignment(Pos.CENTER_LEFT);

        contentHost = new StackPane();
        contentHost.setStyle("-fx-background-color: transparent;");

        ScrollPane scrollPane = new ScrollPane(contentHost);
        scrollPane.setFitToWidth(true);
        scrollPane.setHbarPolicy(ScrollBarPolicy.NEVER);
        scrollPane.setStyle("-fx-background: transparent; -fx-background-color: transparent;");

        main.getChildren().addAll(topBar, scrollPane);
        VBox.setVgrow(scrollPane, Priority.ALWAYS);
        return main;
    }

    private Button createSidebarButton(Section section, String text) {
        Button button = new Button(text);
        button.setMaxWidth(Double.MAX_VALUE);
        button.setPrefHeight(42);
        button.setAlignment(Pos.CENTER_LEFT);
        button.setStyle(sidebarButtonStyle(false, false));
        button.setOnAction(e -> showSection(section));
        sidebarButtons.put(section, button);
        return button;
    }

    private void showSection(Section section) {
        activeSection.set(section);
        sectionTitleLabel.setText(section.label());
        updateSidebarSelection();
        contentHost.getChildren().setAll(buildSection(section));
    }

    private void updateSidebarSelection() {
        sidebarButtons.forEach((section, button) -> button.setStyle(sidebarButtonStyle(section == activeSection.get(), false)));
    }

    private String sidebarButtonStyle(boolean active, boolean danger) {
        if (danger) {
            return "-fx-background-color: #1f2937; -fx-text-fill: #f87171; -fx-font-size: 13; -fx-font-weight: 700; -fx-background-radius: 12; -fx-border-radius: 12; -fx-cursor: hand; -fx-alignment: center-left;";
        }
        if (active) {
            return "-fx-background-color: #2563eb; -fx-text-fill: white; -fx-font-size: 13; -fx-font-weight: 700; -fx-background-radius: 12; -fx-border-radius: 12; -fx-cursor: hand; -fx-alignment: center-left;";
        }
        return "-fx-background-color: transparent; -fx-text-fill: #d1d5db; -fx-font-size: 13; -fx-font-weight: 600; -fx-background-radius: 12; -fx-border-radius: 12; -fx-cursor: hand; -fx-alignment: center-left;";
    }

    private Node buildSection(Section section) {
        return switch (section) {
            case DASHBOARD -> buildDashboardSection();
            case ADD_VEHICLE -> buildAddVehicleSection();
            case CATEGORIES -> buildCategoriesSection();
            case ADD_CATEGORY -> buildAddCategorySection();
            case MANAGE -> buildManageSection();
            case MANAGE_VEHICLES -> buildManageVehiclesSection();
            case INCOMING -> buildIncomingSection();
            case OUTGOING -> buildOutgoingSection();
            case REPORTS -> buildReportsSection();
            case BY_DATE_RANGE -> buildDateRangeSection();
            case SEARCH_VEHICLE -> buildSearchSection();
            case PARKING_SEATS -> buildParkingSeatsSection();
            case USER_MEMBERSHIP -> buildMembershipSection();
        };
    }

    private Node buildDashboardSection() {
        List<ParkingSlot> slots = navigator.context().slotUseCase().getAllSlots();
        List<Reservation> reservations = navigator.context().reservationUseCase().getAllReservations();

        long todayEntries = reservations.stream().filter(this::isToday).count();
        long yesterdayEntries = reservations.stream().filter(this::isYesterday).count();
        long last7Days = reservations.stream().filter(r -> !r.startTime().isBefore(LocalDateTime.now().minusDays(7))).count();
        long totalAllTime = reservations.size();
        long currentlyParked = reservations.stream().filter(r -> r.status() == ReservationStatus.ACTIVE).count();
        long totalCapacity = slots.size();

        VBox page = new VBox(18);
        page.getChildren().addAll(
                buildStatsGrid(todayEntries, yesterdayEntries, last7Days, totalAllTime, currentlyParked, totalCapacity),
                buildQuickActionsRow(),
                buildOverviewCards(slots, reservations)
        );
        return page;
    }

    private Node buildAddVehicleSection() {
        TextField slotName = new TextField();
        slotName.setPromptText("e.g. C1");
        slotName.setPrefHeight(40);

        Label feedback = createFeedbackLabel();

        Button save = createPrimaryButton("Add Slot", () -> {
            String value = slotName.getText() == null ? "" : slotName.getText().trim();
            if (value.isEmpty()) {
                feedback.setText("Please enter a slot name.");
                return;
            }
            navigator.context().slotUseCase().addSlot(value);
            showSection(Section.DASHBOARD);
        });

        return buildFormPage(
                "Add Vehicle / Parking Slot",
                "Use this card to create a new parking slot.",
                buildCard(
                        "Quick Create",
                        new VBox(12,
                                labelledField("Slot name", slotName),
                                save,
                                feedback
                        )
                )
        );
    }

    private Node buildCategoriesSection() {
        List<ParkingSlot> slots = navigator.context().slotUseCase().getAllSlots();
        long available = slots.stream().filter(slot -> slot.status() == SlotStatus.AVAILABLE).count();
        long reserved = slots.stream().filter(slot -> slot.status() == SlotStatus.RESERVED).count();
        long occupied = slots.stream().filter(slot -> slot.status() == SlotStatus.OCCUPIED).count();

        VBox legend = new VBox(12,
                createLegendRow("Available", available, "#22c55e"),
                createLegendRow("Reserved", reserved, "#f59e0b"),
                createLegendRow("Occupied", occupied, "#ef4444")
        );

        return buildFormPage(
                "Categories",
                "Status groups are derived from the current parking slots.",
                buildCard("Slot Categories", legend)
        );
    }

    private Node buildAddCategorySection() {
        TextField slotIdField = new TextField();
        slotIdField.setPromptText("Slot ID");
        slotIdField.setPrefHeight(40);

        ComboBox<SlotStatus> statusCombo = new ComboBox<>();
        statusCombo.getItems().addAll(SlotStatus.values());
        statusCombo.setValue(SlotStatus.AVAILABLE);
        statusCombo.setPrefHeight(40);

        Label feedback = createFeedbackLabel();

        Button update = createPrimaryButton("Apply Category", () -> {
            Integer slotId = tryParseInt(slotIdField.getText());
            if (slotId == null) {
                feedback.setText("Please enter a valid slot ID.");
                return;
            }
            navigator.context().slotUseCase().updateSlotStatus(slotId, statusCombo.getValue());
            showSection(Section.MANAGE_VEHICLES);
        });

        return buildFormPage(
                "Add Category",
                "Map a slot to a status category.",
                buildCard(
                        "Update Slot Status",
                        new VBox(12,
                                labelledField("Slot ID", slotIdField),
                                labelledField("Status", statusCombo),
                                update,
                                feedback
                        )
                )
        );
    }

    private Node buildManageSection() {
        List<ParkingSlot> slots = navigator.context().slotUseCase().getAllSlots();
        List<Reservation> reservations = navigator.context().reservationUseCase().getAllReservations();

        return buildTwoColumnPage(
                buildCard("All Parking Slots", buildSlotList(slots)),
                buildCard("All Reservations", buildReservationList(reservations))
        );
    }

    private Node buildManageVehiclesSection() {
        List<ParkingSlot> slots = navigator.context().slotUseCase().getAllSlots();

        TextField slotIdField = new TextField();
        slotIdField.setPromptText("Slot ID");
        slotIdField.setPrefHeight(40);

        ComboBox<SlotStatus> statusCombo = new ComboBox<>();
        statusCombo.getItems().addAll(SlotStatus.values());
        statusCombo.setValue(SlotStatus.AVAILABLE);
        statusCombo.setPrefHeight(40);

        Label feedback = createFeedbackLabel();

        Button update = createPrimaryButton("Update Status", () -> {
            Integer slotId = tryParseInt(slotIdField.getText());
            if (slotId == null) {
                feedback.setText("Please enter a valid slot ID.");
                return;
            }
            navigator.context().slotUseCase().updateSlotStatus(slotId, statusCombo.getValue());
            showSection(Section.MANAGE_VEHICLES);
        });

        VBox form = new VBox(12,
                labelledField("Slot ID", slotIdField),
                labelledField("Status", statusCombo),
                update,
                feedback
        );

        return buildTwoColumnPage(
                buildCard("Vehicles / Slots", buildSlotList(slots)),
                buildCard("Update Vehicle Status", form)
        );
    }

    private Node buildIncomingSection() {
        List<Reservation> activeReservations = navigator.context().reservationUseCase().getAllReservations().stream()
                .filter(reservation -> reservation.status() == ReservationStatus.ACTIVE)
                .collect(Collectors.toList());
        return buildFormPage("Incoming", "Currently active reservations.", buildCard("Incoming Vehicles", buildReservationList(activeReservations)));
    }

    private Node buildOutgoingSection() {
        List<Reservation> closedReservations = navigator.context().reservationUseCase().getAllReservations().stream()
                .filter(reservation -> reservation.status() != ReservationStatus.ACTIVE)
                .collect(Collectors.toList());
        return buildFormPage("Outgoing", "Completed or cancelled reservations.", buildCard("Outgoing Vehicles", buildReservationList(closedReservations)));
    }

    private Node buildReportsSection() {
        List<ParkingSlot> slots = navigator.context().slotUseCase().getAllSlots();
        List<Reservation> reservations = navigator.context().reservationUseCase().getAllReservations();

        long activeReservations = reservations.stream().filter(reservation -> reservation.status() == ReservationStatus.ACTIVE).count();
        long closedReservations = reservations.size() - activeReservations;
        long available = slots.stream().filter(slot -> slot.status() == SlotStatus.AVAILABLE).count();
        long reserved = slots.stream().filter(slot -> slot.status() == SlotStatus.RESERVED).count();
        long occupied = slots.stream().filter(slot -> slot.status() == SlotStatus.OCCUPIED).count();

        VBox reportBlock = new VBox(14,
                createLegendRow("Active reservations", activeReservations, "#2563eb"),
                createLegendRow("Closed reservations", closedReservations, "#64748b"),
                createLegendRow("Available slots", available, "#22c55e"),
                createLegendRow("Reserved slots", reserved, "#f59e0b"),
                createLegendRow("Occupied slots", occupied, "#ef4444")
        );

        return buildFormPage("Reports", "High-level usage summary.", buildCard("Report Summary", reportBlock));
    }

    private Node buildDateRangeSection() {
        DatePicker fromDate = new DatePicker();
        DatePicker toDate = new DatePicker();
        ListView<String> results = new ListView<>();
        Label feedback = createFeedbackLabel();

        Button filter = createPrimaryButton("Filter", () -> {
            results.getItems().clear();
            LocalDate from = fromDate.getValue();
            LocalDate to = toDate.getValue();
            if (from == null || to == null) {
                feedback.setText("Choose both dates to search.");
                return;
            }

            List<Reservation> matching = navigator.context().reservationUseCase().getAllReservations().stream()
                    .filter(reservation -> !reservation.startTime().toLocalDate().isBefore(from) && !reservation.startTime().toLocalDate().isAfter(to))
                    .collect(Collectors.toList());

            results.getItems().addAll(formatReservations(matching));
            feedback.setText("Found " + matching.size() + " reservation(s).");
        });

        VBox form = new VBox(12,
                labelledField("From", fromDate),
                labelledField("To", toDate),
                filter,
                feedback,
                results
        );
        VBox.setVgrow(results, Priority.ALWAYS);

        return buildFormPage("By Date Range", "Search reservations by start date.", buildCard("Date Range Search", form));
    }

    private Node buildSearchSection() {
        TextField queryField = new TextField();
        queryField.setPromptText("Search by slot, reservation, user id, or status");
        queryField.setPrefHeight(40);

        ListView<String> results = new ListView<>();
        Label feedback = createFeedbackLabel();

        Button search = createPrimaryButton("Search", () -> {
            String query = queryField.getText() == null ? "" : queryField.getText().trim().toLowerCase();
            results.getItems().clear();
            if (query.isEmpty()) {
                feedback.setText("Enter a search term.");
                return;
            }

            List<String> matches = new ArrayList<>();
            for (ParkingSlot slot : navigator.context().slotUseCase().getAllSlots()) {
                String candidate = ("slot " + slot.id() + " " + slot.name() + " " + slot.status()).toLowerCase();
                if (candidate.contains(query)) {
                    matches.add("Slot: " + slot.id() + " | " + slot.name() + " | " + slot.status());
                }
            }
            for (Reservation reservation : navigator.context().reservationUseCase().getAllReservations()) {
                String candidate = ("reservation " + reservation.id() + " " + reservation.userId() + " " + reservation.slotId() + " " + reservation.status()).toLowerCase();
                if (candidate.contains(query)) {
                    matches.add(formatReservation(reservation));
                }
            }

            results.getItems().addAll(matches);
            feedback.setText("Found " + matches.size() + " result(s).");
        });

        VBox form = new VBox(12, queryField, search, feedback, results);
        VBox.setVgrow(results, Priority.ALWAYS);

        return buildFormPage("Search Vehicle", "Search the current parking data.", buildCard("Search", form));
    }

    private Node buildParkingSeatsSection() {
        List<ParkingSlot> slots = navigator.context().slotUseCase().getAllSlots();
        GridPane grid = new GridPane();
        grid.setHgap(12);
        grid.setVgap(12);
        grid.setPadding(new Insets(6));

        for (int i = 0; i < slots.size(); i++) {
            ParkingSlot slot = slots.get(i);
            Button seat = new Button(slot.name() + "\n" + slot.status());
            seat.setPrefSize(120, 78);
            seat.setWrapText(true);
            seat.setStyle(seatStyle(slot.status()));
            int column = i % 5;
            int row = i / 5;
            grid.add(seat, column, row);
        }

        VBox card = new VBox(12,
                new Label("Parking seats are color coded by status."),
                grid
        );
        return buildFormPage("Parking Seats", "Quick visual snapshot of the lot.", buildCard("Seats", card));
    }

    private Node buildMembershipSection() {
        List<Reservation> reservations = navigator.context().reservationUseCase().getAllReservations();
        Map<Integer, Long> grouped = reservations.stream()
                .collect(Collectors.groupingBy(Reservation::userId, Collectors.counting()));

        ListView<String> list = new ListView<>();
        grouped.entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .forEach(entry -> list.getItems().add("User #" + entry.getKey() + " — " + entry.getValue() + " reservation(s)"));

        VBox body = new VBox(12,
                new Label("Current admin: " + navigator.context().currentUser().username()),
                new Label("Membership is summarized from reservation activity."),
                list
        );
        VBox.setVgrow(list, Priority.ALWAYS);

        return buildFormPage("User Membership", "Overview of active users and their usage.", buildCard("Membership", body));
    }

    private Node buildStatsGrid(long todayEntries, long yesterdayEntries, long last7Days, long totalAllTime, long currentlyParked, long totalCapacity) {
        GridPane grid = new GridPane();
        grid.setHgap(18);
        grid.setVgap(18);
        grid.getColumnConstraints().addAll(column(), column(), column(), column());

        grid.add(createMetricCard("#22c55e", "🚗", todayEntries, "Today\'s Entries"), 0, 0);
        grid.add(createMetricCard("#3b82f6", "🕒", yesterdayEntries, "Yesterday\'s Entries"), 1, 0);
        grid.add(createMetricCard("#f59e0b", "🗓", last7Days, "Last 7 Days"), 2, 0);
        grid.add(createMetricCard("#8b5cf6", "🧮", totalAllTime, "Total All-Time"), 3, 0);

        grid.add(createMetricCard("#ef4444", "🅿", currentlyParked, "Currently Parked"), 0, 1, 2, 1);
        grid.add(createMetricCard("#14b8a6", "▦", totalCapacity, "Total Parking Capacity"), 2, 1, 2, 1);

        return grid;
    }

    private Node buildQuickActionsRow() {
        HBox actions = new HBox(10,
                createActionButton("+ Add Vehicle", Section.ADD_VEHICLE),
                createActionButton("↩ Incoming", Section.INCOMING),
                createActionButton("↪ Outgoing", Section.OUTGOING),
                createActionButton("🔎 Search", Section.SEARCH_VEHICLE),
                createActionButton("📊 Reports", Section.REPORTS),
                createActionButton("🅿 Seats", Section.PARKING_SEATS),
                createActionButton("👥 Members", Section.USER_MEMBERSHIP)
        );
        actions.setAlignment(Pos.CENTER_LEFT);

        VBox wrapper = new VBox(10,
                sectionCardHeader("Quick Actions", "Shortcuts to common admin tasks"),
                actions
        );
        wrapper.setStyle(cardStyle());
        wrapper.setPadding(new Insets(20));
        wrapper.setMinHeight(110);
        return wrapper;
    }

    private Node buildOverviewCards(List<ParkingSlot> slots, List<Reservation> reservations) {
        VBox left = new VBox(12,
                sectionCardHeader("Parking Slots", "Current status of the lot"),
                buildSlotList(slots)
        );

        VBox right = new VBox(12,
                sectionCardHeader("Reservations", "Recent reservation activity"),
                buildReservationList(reservations.stream().sorted(Comparator.comparing(Reservation::startTime).reversed()).collect(Collectors.toList()))
        );

        return buildTwoColumnPage(buildCard("Parking Slots", left), buildCard("Reservations", right));
    }

    private Node buildFormPage(String title, String description, Node card) {
        VBox page = new VBox(16);
        Label pageTitle = new Label(title);
        pageTitle.setStyle("-fx-font-size: 22; -fx-font-weight: 700; -fx-text-fill: #111827;");
        Label pageDescription = new Label(description);
        pageDescription.setStyle("-fx-text-fill: #6b7280; -fx-font-size: 13;");
        page.getChildren().addAll(pageTitle, pageDescription, card);
        return page;
    }

    private Node buildTwoColumnPage(Node left, Node right) {
        HBox row = new HBox(18, left, right);
        HBox.setHgrow(left, Priority.ALWAYS);
        HBox.setHgrow(right, Priority.ALWAYS);
        return row;
    }

    private Node buildCard(String title, Node content) {
        VBox card = new VBox(14, sectionCardHeader(title, ""), content);
        card.setStyle(cardStyle());
        card.setPadding(new Insets(20));
        VBox.setVgrow(content, Priority.ALWAYS);
        return card;
    }

    private VBox sectionCardHeader(String title, String subtitle) {
        Label heading = new Label(title);
        heading.setStyle("-fx-font-size: 17; -fx-font-weight: 700; -fx-text-fill: #111827;");

        VBox header = new VBox(2);
        header.getChildren().add(heading);
        if (subtitle != null && !subtitle.isBlank()) {
            Label sub = new Label(subtitle);
            sub.setStyle("-fx-text-fill: #6b7280; -fx-font-size: 12;");
            header.getChildren().add(sub);
        }
        return header;
    }

    private Label createFeedbackLabel() {
        Label feedback = new Label();
        feedback.setStyle("-fx-text-fill: #b91c1c; -fx-font-size: 12;");
        return feedback;
    }

    private Node createMetricCard(String color, String icon, long value, String label) {
        VBox card = new VBox(10);
        card.setPrefHeight(150);
        card.setPadding(new Insets(18));
        card.setStyle("-fx-background-color: linear-gradient(to bottom right, " + color + ", derive(" + color + ", -12%)); -fx-background-radius: 18; -fx-border-radius: 18; -fx-effect: dropshadow(gaussian, rgba(15, 23, 42, 0.15), 18, 0.12, 0, 6);");

        Label iconLabel = new Label(icon);
        iconLabel.setStyle("-fx-font-size: 24; -fx-text-fill: white;");

        Label valueLabel = new Label(String.valueOf(value));
        valueLabel.setStyle("-fx-font-size: 34; -fx-font-weight: 800; -fx-text-fill: white;");

        Label nameLabel = new Label(label);
        nameLabel.setStyle("-fx-font-size: 13; -fx-text-fill: rgba(255,255,255,0.92);");

        card.getChildren().addAll(iconLabel, valueLabel, nameLabel);
        return card;
    }

    private Node createActionButton(String text, Section section) {
        Button button = new Button(text);
        button.setPrefHeight(38);
        button.setStyle("-fx-background-color: #e5e7eb; -fx-background-radius: 12; -fx-text-fill: #111827; -fx-font-weight: 700; -fx-cursor: hand;");
        button.setOnAction(e -> showSection(section));
        return button;
    }

    private Node createLegendRow(String label, long count, String color) {
        HBox row = new HBox(12);
        row.setAlignment(Pos.CENTER_LEFT);

        Region dot = new Region();
        dot.setPrefSize(14, 14);
        dot.setStyle("-fx-background-color: " + color + "; -fx-background-radius: 999;");

        Label labelText = new Label(label);
        labelText.setStyle("-fx-text-fill: #111827; -fx-font-size: 13; -fx-font-weight: 600;");

        Region spacer = new Region();
        HBox.setHgrow(spacer, Priority.ALWAYS);

        Label countLabel = new Label(String.valueOf(count));
        countLabel.setStyle("-fx-text-fill: #111827; -fx-font-size: 13; -fx-font-weight: 800;");

        row.getChildren().addAll(dot, labelText, spacer, countLabel);
        return row;
    }

    private Node buildSlotList(List<ParkingSlot> slots) {
        ListView<String> list = new ListView<>();
        list.getItems().addAll(slots.stream()
                .map(slot -> "Slot " + slot.id() + " • " + slot.name() + " • " + slot.status())
                .collect(Collectors.toList()));
        return list;
    }

    private Node buildReservationList(List<Reservation> reservations) {
        ListView<String> list = new ListView<>();
        list.getItems().addAll(formatReservations(reservations));
        return list;
    }

    private List<String> formatReservations(List<Reservation> reservations) {
        return reservations.stream().map(this::formatReservation).collect(Collectors.toList());
    }

    private String formatReservation(Reservation reservation) {
        return "Res#" + reservation.id() + " • User:" + reservation.userId() + " • Slot:" + reservation.slotId()
                + " • " + reservation.status() + " • " + reservation.startTime().format(DATE_TIME_FORMATTER);
    }

    private Node labelledField(String label, Node field) {
        VBox wrapper = new VBox(6);
        Label text = new Label(label);
        text.setStyle("-fx-text-fill: #374151; -fx-font-size: 12; -fx-font-weight: 700;");
        wrapper.getChildren().addAll(text, field);
        return wrapper;
    }

    private Button createPrimaryButton(String text, Runnable action) {
        Button button = new Button(text);
        button.setPrefHeight(40);
        button.setStyle("-fx-background-color: #2563eb; -fx-text-fill: white; -fx-font-weight: 700; -fx-background-radius: 12; -fx-cursor: hand;");
        button.setOnAction(e -> action.run());
        return button;
    }

    private String cardStyle() {
        return "-fx-background-color: white; -fx-background-radius: 18; -fx-border-radius: 18; -fx-border-color: #e5e7eb; -fx-effect: dropshadow(gaussian, rgba(15, 23, 42, 0.08), 18, 0.10, 0, 4);";
    }

    private String seatStyle(SlotStatus status) {
        return switch (status) {
            case AVAILABLE -> "-fx-background-color: #22c55e; -fx-background-radius: 14; -fx-text-fill: white; -fx-font-weight: 700; -fx-cursor: hand;";
            case RESERVED -> "-fx-background-color: #f59e0b; -fx-background-radius: 14; -fx-text-fill: white; -fx-font-weight: 700; -fx-cursor: hand;";
            case OCCUPIED -> "-fx-background-color: #ef4444; -fx-background-radius: 14; -fx-text-fill: white; -fx-font-weight: 700; -fx-cursor: hand;";
        };
    }

    private ColumnConstraints column() {
        ColumnConstraints columnConstraints = new ColumnConstraints();
        columnConstraints.setPercentWidth(25);
        columnConstraints.setHgrow(Priority.ALWAYS);
        return columnConstraints;
    }

    private Integer tryParseInt(String value) {
        try {
            return Integer.parseInt(value == null ? "" : value.trim());
        } catch (NumberFormatException ex) {
            return null;
        }
    }

    private boolean isToday(Reservation reservation) {
        return reservation.startTime().toLocalDate().equals(LocalDate.now());
    }

    private boolean isYesterday(Reservation reservation) {
        return reservation.startTime().toLocalDate().equals(LocalDate.now().minusDays(1));
    }

}
