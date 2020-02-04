import {DataManager, DataMgr} from "../../Model/DataManager";

export class AudioManager {
    _playMusic: Map<string, cc.AudioClip>;
    _playEffect: Map<string, cc.AudioClip>;
    _switchMusic: boolean;
    _switchEffect: boolean;
    _effectVolume: number;
    _musicVolume: number;
    musicId: number;
    private audioInitComplete: boolean = false;

    init() {
        //cc.log("audioManager init");
        // if (!JSON.parse(cc.sys.localStorage.getItem('audioData'))) {
        //     let audioData = {
        //         musicSwitch: true,
        //         musicVolume: 1,
        //         soundSwitch: true,
        //         soundVolume: 1,
        //     };
        //     cc.sys.localStorage.setItem('audioData', JSON.stringify(audioData));
        // }
        // this.musicId = -1;
        // let audioSetting = JSON.parse(cc.sys.localStorage.getItem("audioData"));
        if (!this.audioInitComplete) {
            this.audioInitComplete = true;
            this._playMusic = new Map<string, cc.AudioClip>();           // 缓存音乐，{name: ID}
            this._playEffect = new Map<string, cc.AudioClip>();             // 缓存音效，{name: ID}
            this._switchMusic = DataMgr.settingData.musicBol;          // 音乐开关
            this._switchEffect = DataMgr.settingData.soundBol;          // 音效开关
            this.playMusic("Audio/ydgqq", true);
        }
        cc.audioEngine.setMusicVolume(0.6);
        // this._effectVolume = audioSetting.soundVolume;              // 音效音量
        // this._musicVolume = audioSetting.musicVolume;              // 音乐音量
        // // this.reLoadRes();
        // this.setEffectVolume(this._effectVolume);
        // this.setMusicVolume(this._musicVolume);
        // 获取本地设置音量大小
        // let audioSetting   = JSON.parse(cc.sys.localStorage.getItem("audio"));
        // this._effectVolume = audioSetting["effect"] || 1;
        // this._musicVolume  = audioSetting["music"] || 1;
        // //获取本地开关设置
        // let switchSetting = JSON.parse(cc.sys.localStorage.getItem("audioSwitch"));
        // this.initSwitch(switchSetting["switchMusic"], switchSetting["switchEffect"]);
        //游戏设置存入本地
    }

    updateSwitchData(){
        this._switchMusic = DataMgr.settingData.musicBol;          // 音乐开关
        this._switchEffect = DataMgr.settingData.soundBol;          // 音效开关
    }


    //保存设置
    setAudioData = (k, v) => {
        let audioData = JSON.parse(cc.sys.localStorage.getItem('audioData'));
        for (let i in audioData) {
            if (i === k) {
                audioData[k] = v;
                break;
            }
        }
        cc.sys.localStorage.setItem('audioData', JSON.stringify(audioData));
    }

    /**
     * 初始化音乐，音效开关
     */

    initSwitch(switchMusic, switchEffect) {
        this._switchEffect = switchEffect || true;
        this._switchMusic = switchMusic || true;
    }

    /**
     * 加载文件夹下所有音频资源
     * url: 资源所在文件夹
     */
    // private audioMap: Map<string, cc.AudioClip> = null;

    reLoadRes() {
        // if (this.audioMap) {
        //     return;
        // }
        // this.audioMap = new Map<string, cc.AudioClip>();
        cc.loader.loadResDir("Audio", cc.AudioClip, (err, res) => {
            if (err) {
                cc.error("【音频】资源加载错误");
                return;
            }
            // let leg:number = res.length;
            // for (let i = 0;i<leg;i++) {
            //     cc.log(res[i].name);
            //     this.audioMap.set(res[i].name,res[i]);
            // }
            // this.play("ydgqq",true,1);
            this.playMusic("Audio/ydgqq", true);
        });
    }

    play(name: string, loop: boolean, value) {
        // cc.log(this.audioMap)
        // let ac : cc.AudioClip = this.audioMap.get(name);
        // cc.log(ac);
        // cc.audioEngine.play(ac,loop,value);
    }

    /**
     * 播放音效文件
     * url: 音效文件相对地址
     * loop: 是否循环播放
     */
    playEffect(url: string, loop: boolean = false): any {
        if (!DataMgr.settingData.soundBol) return;
        if (this._switchEffect) {
            if (this._playEffect[url]) {
                this.setResumeEffect(url);
                return;
            }

            if (this._playEffect.get(url)) {
                cc.audioEngine.playEffect(this._playEffect.get(url), loop)
            } else {
                cc.loader.loadRes(url, cc.AudioClip, (err, clip) => {
                    if (err) {
                        cc.error("【音频】资源加载错误");
                        return;
                    }
                    let effectId = cc.audioEngine.playEffect(clip, loop);
                    this._playEffect.set(url, clip)
                });
            }

            let getRes: cc.AudioClip = cc.loader.getRes(url);
            if (getRes) {
                let effectId = cc.audioEngine.playEffect(getRes, loop);
                this._playEffect[url] = effectId;
            } else {
                cc.warn("【音频】音效" + url + "文件不存在");
            }
        }
    }

    /**
     * 转换音效开关
     */
    switchEffectFunc() {
        this._switchEffect = !this._switchEffect;
        if (!this._switchEffect) {
            this.setStopAllEffect();
        }
        this.setAudioData("soundSwitch", this._switchEffect);
        // cc.sys.localStorage.setItem("audioSwitch", JSON.stringify({switchEffect: this._switchEffect, switchMusic: this._switchMusic}));
    }

    /**
     * 获取音效开关状态
     */
    getSwitchEffect() {
        return this._switchEffect;
    }

    /**
     * 设置音效声音大小
     * value: 0.0 - 1.0
     */
    setEffectVolume(value) {
        this._effectVolume = value;
        cc.audioEngine.setEffectsVolume(value);
        this.setAudioData("soundVolume", value);
        // cc.sys.localStorage.setItem("audio", JSON.stringify({effect: this._effectVolume, music: this._musicVolume}));
    }

    /**
     * 获取音效大小
     * @return 0.0 - 1.0
     */
    getEffectVolume() {
        return cc.audioEngine.getEffectsVolume();
    }

    /**
     * 暂停指定音效
     * url： 资源路径
     */
    setPauseEffect(url) {
        var audio = this._playEffect[url];
        if (audio) {
            cc.audioEngine.pauseEffect(audio);
        } else {
            cc.error("【音频】音效文件" + url + "不存在");
        }
    }

    /**
     * 暂停正在播放的所有音效
     */
    setPauseAllEffect() {
        cc.audioEngine.pauseAllEffects();
    }

    /**
     * 恢复指定音效
     * url:资源路径
     */
    setResumeEffect(url) {
        let audio = this._playEffect[url];
        if (audio) {
            cc.audioEngine.resumeEffect(audio);
        } else {
            cc.error("【音频】音效文件" + url + "不存在");
        }
    }

    /**
     * 恢复当前说暂停的所有音效
     */
    setResumeAllEffect() {
        cc.audioEngine.resumeAllEffects();
    }

    /**
     * 停止播放指定音效
     * url: 资源路径
     */
    setStopEffect(url) {
        // let audio = this._playEffect[url];
        // if(audio){
        //     cc.audioEngine.stopEffect(audio);
        // }
        // else{
        //     cc.error("【音频】音效文件" + url + "不存在");
        // }
    }

    /**
     * 停止播放所有正在播放的音效
     */
    setStopAllEffect() {
        cc.audioEngine.stopAllEffects();
    }

    /**
     * 背景音乐播放
     * url: 资源路径
     * loop: 是否循环
     */
    playMusic(url, loop = false) {
        if (!DataMgr.settingData.musicBol) return;
        this.setStopMusic();
        if (!this._playMusic) {
            cc.log("not found _playMusic cache!");
            return;
        }
        if (this._playMusic.get(url)) {
            if(this._switchMusic){
                this.musicId = cc.audioEngine.playMusic(this._playMusic.get(url), loop);
            }
        } else {
            let getRes: cc.AudioClip = cc.loader.getRes(url);
            if(getRes){
                if(this._switchMusic){
                    cc.audioEngine.playMusic(getRes, loop);
                }
            }else{
                cc.loader.loadRes(url, cc.AudioClip, (err, clip) => {
                    if (err) {
                        cc.error("【音频】资源加载错误");
                        return;
                    }
                    if(this._switchMusic){
                        this.musicId = cc.audioEngine.playMusic(clip, loop);
                    }
                    this._playMusic.set(url, clip)
                });
            }
        }
    }

    /**
     * 转换音乐按钮开关
     */
    switchMusicFunc() {
        this._switchMusic = !this._switchMusic;
        if (!this._switchMusic) {
            this.setPauseMusic();
        } else {
            this.setResumeMusic();
        }
        this.setAudioData("musicSwitch", this._switchMusic);
    }

    /**
     * 获取音乐开关状态
     */
    getSwitchMusic() {
        return this._switchMusic;
    }

    /**
     * 暂停当前播放音乐
     */
    setPauseMusic() {
        // cc.audioEngine.pauseMusic();
        if (this.musicId >= 0) {
            cc.audioEngine.pause(this.musicId);
        }
    }

    /**
     * 恢复当前被暂停音乐音乐
     */
    setResumeMusic() {
        // cc.audioEngine.resumeMusic();
        if (this.musicId >= 0) {
            cc.audioEngine.resume(this.musicId);
        }
    }

    /**
     * 重新播放该背景音乐
     */
    replayMusic() {
        // cc.audioEngine.rewindMusic();
    }

    /**
     * 暂停播放音乐
     * releaseData： 控制是否释放音乐资源 true释放资源 | false不释放资源
     */
    setStopMusic(releaseData = true) {
        cc.audioEngine.stopMusic();
    }

    //设置音量大小
    setMusicVolume(value) {
        this._musicVolume = value;
        cc.audioEngine.setMusicVolume(value);
        this.setAudioData("musicVolume", value);
        // cc.sys.localStorage.setItem("audio", JSON.stringify({effect: this._effectVolume, music: this._musicVolume}));
    }

    //获取音量大小
    getMusicVolume() {
        return cc.audioEngine.getMusicVolume();
    }

    /**
     * 音乐是否正在播放（验证些方法来实现背景音乐是否播放完成）
     * return boolen
     */
    isMusicPlaying() {
        return cc.audioEngine.isMusicPlaying();
    }

    /**
     * 释放指定音效资源
     * url
     */
    releaseAudio(url) {
        var rawUrl = cc.url.raw(url);
        if (cc.loader.getRes(rawUrl)) {
            // cc.audioEngine.unloadEffect(rawUrl);
        } else {
            cc.error("【音频】资源" + url + "不存在， 释放失败");
        }

    }

    releaseAllAudio() {
        cc.audioEngine.uncacheAll();
    }

    private static _instance: AudioManager;

    static instance(): AudioManager {
        if (AudioManager._instance == null) {
            AudioManager._instance = new AudioManager();
        }
        return AudioManager._instance;
    }

}

export const AudioMgr: AudioManager = AudioManager.instance();
