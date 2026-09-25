extends Control

var is_french := true
var title_label: Label
var platform_label: Label
var controls_label: Label
var language_button: Button
var start_button: Button
var mobile_demo: Label

func _ready() -> void:
    create_menu()

func is_mobile() -> bool:
    return OS.has_feature("mobile")

func create_menu() -> void:
    var background := ColorRect.new()
    background.color = Color("#183542")
    background.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
    add_child(background)
    var accent := ColorRect.new()
    accent.color = Color("#4aa3a2")
    accent.position = Vector2(0, 0)
    accent.size = Vector2(12, 720)
    add_child(accent)
    title_label = make_label("WRAITH\nECHOES", Vector2(110, 92), Vector2(540, 150), 64, Color("#f4c95d"))
    platform_label = make_label("", Vector2(112, 260), Vector2(500, 36), 22, Color("#b8f2e6"))
    controls_label = make_label("", Vector2(112, 330), Vector2(600, 105), 22, Color("#ffffff"))
    mobile_demo = make_label("", Vector2(112, 460), Vector2(600, 80), 19, Color("#b8f2e6"))
    start_button = Button.new()
    start_button.text = "JOUER"
    start_button.position = Vector2(112, 575)
    start_button.size = Vector2(280, 62)
    start_button.add_theme_font_size_override("font_size", 24)
    start_button.pressed.connect(func(): get_tree().change_scene_to_file("res://scenes/main.tscn"))
    add_child(start_button)
    language_button = Button.new()
    language_button.text = "FR / EN"
    language_button.position = Vector2(1080, 32)
    language_button.size = Vector2(150, 46)
    language_button.pressed.connect(toggle_language)
    add_child(language_button)
    update_language()

func make_label(text_value: String, position_value: Vector2, size_value: Vector2, font_size: int, color: Color) -> Label:
    var label := Label.new()
    label.text = text_value
    label.position = position_value
    label.size = size_value
    label.add_theme_font_size_override("font_size", font_size)
    label.add_theme_color_override("font_color", color)
    add_child(label)
    return label

func toggle_language() -> void:
    is_french = not is_french
    update_language()

func update_language() -> void:
    language_button.text = "FR" if is_french else "EN"
    if is_mobile():
        platform_label.text = "PLATEFORME : MOBILE / PORTABLE"
        controls_label.text = "CONTROLES\nGlisser gauche / droite pour bouger\nBoutons SAUT et TIR a l'ecran"
        mobile_demo.text = "Les boutons tactiles seront actifs pendant la partie."
    else:
        platform_label.text = "PLATEFORME : PC"
        controls_label.text = "CONTROLES\nA / D : se deplacer\nESPACE : sauter    E : tirer"
        mobile_demo.text = "Les controles mobiles sont masques sur PC."
    if not is_french:
        platform_label.text = "PLATFORM: MOBILE / HANDHELD" if is_mobile() else "PLATFORM: PC"
        controls_label.text = "CONTROLS\nA / D: move\nSPACE: jump    E: shoot" if not is_mobile() else "CONTROLS\nSwipe left / right to move\nOn-screen JUMP and FIRE buttons"
        mobile_demo.text = "Touch controls are active during gameplay." if is_mobile() else "Touch controls are hidden on PC."
    start_button.text = "JOUER" if is_french else "PLAY"