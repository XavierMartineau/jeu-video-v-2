extends CanvasLayer

var level_label: Label
var coin_label: Label
var lives_label: Label
var message_label: Label
var pause_panel: Panel
var volume_button: Button
var health_bar: ProgressBar

func _ready() -> void:
    layer = 10
    var top_bar := ColorRect.new()
    top_bar.color = Color("#17212b").lerp(Color("#17212b"), 0.2)
    top_bar.position = Vector2(0, 0)
    top_bar.size = Vector2(1280, 62)
    top_bar.mouse_filter = Control.MOUSE_FILTER_IGNORE
    add_child(top_bar)
    level_label = make_label("SECTEUR 1", Vector2(30, 15), 22, Color("#b8f2e6"))
    coin_label = make_label("CRISTAUX 0 / 0", Vector2(235, 15), 20, Color("#f4c95d"))
    lives_label = make_label("VIES 3", Vector2(465, 15), 20, Color("#f4c95d"))
    make_label("VITALITE", Vector2(590, 18), 16, Color("#b8f2e6"))
    health_bar = ProgressBar.new()
    health_bar.position = Vector2(680, 17)
    health_bar.size = Vector2(260, 27)
    health_bar.min_value = 0.0
    health_bar.max_value = 100.0
    health_bar.value = 100.0
    health_bar.show_percentage = true
    health_bar.add_theme_font_size_override("font_size", 14)
    add_child(health_bar)
    volume_button = Button.new()
    volume_button.text = "SON ON"
    volume_button.position = Vector2(1110, 11)
    volume_button.size = Vector2(140, 38)
    volume_button.add_theme_font_size_override("font_size", 16)
    volume_button.pressed.connect(func(): get_parent().toggle_volume())
    add_child(volume_button)
    message_label = make_label("", Vector2(0, 110), 30, Color("#ffffff"))
    message_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
    message_label.size = Vector2(1280, 100)
    message_label.visible = false
    var pause_button := Button.new()
    pause_button.text = "PAUSE"
    pause_button.position = Vector2(965, 11)
    pause_button.size = Vector2(130, 38)
    pause_button.add_theme_font_size_override("font_size", 16)
    pause_button.pressed.connect(func(): get_parent().toggle_pause())
    add_child(pause_button)
    create_pause_panel()
    if OS.has_feature("mobile"):
        create_mobile_controls()

func make_label(text_value: String, position_value: Vector2, font_size: int, color: Color) -> Label:
    var label := Label.new()
    label.text = text_value
    label.position = position_value
    label.add_theme_font_size_override("font_size", font_size)
    label.add_theme_color_override("font_color", color)
    add_child(label)
    return label

func create_pause_panel() -> void:
    pause_panel = Panel.new()
    pause_panel.position = Vector2(440, 155)
    pause_panel.size = Vector2(400, 355)
    pause_panel.visible = false
    add_child(pause_panel)
    var title := Label.new()
    title.text = "JEU EN PAUSE"
    title.position = Vector2(75, 40)
    title.size = Vector2(250, 45)
    title.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
    title.add_theme_font_size_override("font_size", 30)
    title.add_theme_color_override("font_color", Color("#f4c95d"))
    pause_panel.add_child(title)
    var resume := Button.new()
    resume.text = "REPRENDRE"
    resume.position = Vector2(90, 115)
    resume.size = Vector2(220, 52)
    resume.pressed.connect(func(): get_parent().toggle_pause())
    pause_panel.add_child(resume)
    var restart := Button.new()
    restart.text = "RECOMMENCER LE NIVEAU"
    restart.position = Vector2(90, 185)
    restart.size = Vector2(220, 52)
    restart.pressed.connect(func(): get_parent().restart_level())
    pause_panel.add_child(restart)

func update_level(number: int) -> void:
    var names := ["VALLEE DES ECHOS", "MINES SUSPENDUES", "COEUR DU GEANT", "ARENE DU WRAITH"]
    level_label.text = "%d / 4  %s" % [number, names[number - 1]]

func update_coins(value: int, required: int) -> void:
    coin_label.text = "CRISTAUX %d / %d" % [value, required]

func update_lives(value: int) -> void:
    lives_label.text = "VIES %d" % value

func update_health(value: int) -> void:
    if health_bar:
        health_bar.value = value

func update_volume(muted: bool) -> void:
    volume_button.text = "SON OFF" if muted else "SON ON"

func set_pause_visible(value: bool) -> void:
    pause_panel.visible = value
    for child in pause_panel.get_children():
        child.visible = value

func show_message(title: String, subtitle: String) -> void:
    message_label.text = title + "\n" + subtitle
    message_label.visible = true
    await get_tree().create_timer(1.5).timeout
    if is_instance_valid(message_label):
        message_label.visible = false

func show_gameplay() -> void:
    message_label.visible = false
    pause_panel.visible = false

func show_victory() -> void:
    message_label.text = "MISSION ACCOMPLIE !\nLes trois secteurs sont securises."
    message_label.visible = true

func show_game_over() -> void:
    message_label.text = "MISSION ECHOUEE\nAppuie sur ECHAP puis recommence le niveau."
    message_label.visible = true

func create_mobile_controls() -> void:
    var left := create_touch_button("<", Vector2(34, 590), "move_left")
    var right := create_touch_button(">", Vector2(118, 590), "move_right")
    var jump_button := create_touch_button("SAUT", Vector2(1030, 570), "jump")
    var shoot_button := create_touch_button("TIR", Vector2(1140, 570), "shoot")
    var dash_button := create_touch_button("DASH", Vector2(1030, 490), "dash")
    for button in [left, right, jump_button, shoot_button, dash_button]:
        button.add_theme_font_size_override("font_size", 18)

func create_touch_button(text_value: String, position_value: Vector2, action_name: String) -> Button:
    var button := Button.new()
    button.text = text_value
    button.position = position_value
    button.size = Vector2(70, 70)
    button.modulate = Color(1, 1, 1, 0.82)
    button.button_down.connect(func(): Input.action_press(action_name))
    button.button_up.connect(func(): Input.action_release(action_name))
    add_child(button)
    return button
