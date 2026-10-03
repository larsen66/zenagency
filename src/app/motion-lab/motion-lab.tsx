"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, type CSSProperties } from "react";
import { ArrowLeft, ArrowUpRight, Check, Maximize2, Pause, Play, RotateCcw } from "lucide-react";
import { MetalPreview, type LightSettings } from "./metal-preview";
import styles from "./motion-lab.module.css";
import { motionPresets } from "./motion-presets";


const variants = motionPresets;
const variantNumber = (index: number) => String(index + 1).padStart(2, "0");

const defaultSettings: LightSettings = { glow: 1, morph: 1, speed: 1, light: 1, shadow: 1, beamWidth: 1 };

export function MotionLab() {
  const [inspection, setInspection] = useState<number | null>(null);
  const [replay, setReplay] = useState(0);
  const [paused, setPaused] = useState(false);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [backgroundOnly, setBackgroundOnly] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const [individual, setIndividual] = useState(Array(variants.length).fill(0) as number[]);
  const [settings, setSettings] = useState<LightSettings>(defaultSettings);
  const restart = () => { setInspection(null); setPaused(false); setReplay((value) => value + 1); };

  return (
    <main className={styles.lab} lang="ru">
      <header className={styles.header}>
        <Link href="/" className={styles.home}><ArrowLeft size={16} /> На сайт</Link>
        <span className={styles.wordmark}>ZEN<span>®</span> <small>MOTION STUDIES</small></span>
        <span className={styles.counter}>{variants.length} ВАРИАНТОВ</span>
      </header>
      <section className={styles.intro}>
        <div><p className={styles.eyebrow}>ФОРМА / СВЕТ / ДВИЖЕНИЕ</p><h1>Один характер.<br /><span>Семь способов ожить.</span></h1></div>
        <p className={styles.description}>Шесть сценариев формы и света и новый микс: 70% «Схождения граней» + 30% «Волны давления». Сравни движение поверхности, блики и тени в одной палитре.</p>
      </section>
      <div className={styles.toolbar}>
        <p aria-live="polite">{selected === null ? "03: «Натяжение», ориентир для сравнения остальных." : `Выбран ${variantNumber(selected)} · ${variants[selected].name}`}</p>
        <div>
          <button aria-pressed={backgroundOnly} onClick={() => setBackgroundOnly((value) => !value)}>{backgroundOnly ? "С контентом" : "Только фон"}</button>
          {expanded !== null && <button onClick={() => { setExpanded(null); window.scrollTo(0, 0); }}><ArrowLeft size={15} /> Все варианты</button>}
          {expanded !== null && expanded > 0 && <button onClick={() => { setExpanded(expanded - 1); restart(); }}>Предыдущий</button>}
          {expanded !== null && expanded < variants.length - 1 && <button onClick={() => { setExpanded(expanded + 1); restart(); }}>Следующий</button>}
          <button onClick={() => { setInspection(null); setPaused((value) => !value); }} aria-pressed={paused}>{paused ? <Play size={15} /> : <Pause size={15} />}{paused ? "Продолжить" : "Пауза"}</button>
          <button onClick={restart}><RotateCcw size={15} /> Повторить {expanded === null ? "все" : "появление"}</button>
        </div>
      </div>
      <div className={styles.controls} aria-label="Настройки шейдера">

        {([{ key: "glow", title: "Свечение", min: 0, max: 2 }, { key: "morph", title: "Движение формы", min: 0, max: 2 }, { key: "light", title: "Сила света", min: 0, max: 2 }, { key: "shadow", title: "Глубина теней", min: 0, max: 2 }, { key: "beamWidth", title: "Ширина блика", min: 0.4, max: 2 }, { key: "speed", title: "Скорость", min: 0.25, max: 2 }] as const).map(({ key, title, min, max }) => <label key={key}>{title}<output>{settings[key].toFixed(2)}×</output><input aria-label={title} type="range" min={min} max={max} step={0.05} value={settings[key]} onChange={(event) => setSettings((value) => ({ ...value, [key]: Number(event.target.value) }))} /></label>)}
        <button onClick={() => setSettings(defaultSettings)}>Сбросить</button>
      </div>
      {expanded !== null && <label className={styles.scrubber}>Кадр появления <output>{Math.round((inspection ?? 0) * 100)}%</output><input aria-label="Кадр появления" type="range" min="0" max="1" step="0.01" value={inspection ?? 0} onChange={(event) => { setInspection(Number(event.target.value)); setPaused(true); }} /><span>Передвигай ползунок, чтобы проверить промежуточную форму. «Продолжить» запускает сцену с этого момента.</span></label>}
      <section className={`${styles.grid} ${expanded !== null ? styles.expanded : ""}`} aria-label="Варианты анимации">
        {variants.map((variant, index) => (expanded === null || expanded === index) && (
          <article key={index} className={`${styles.card} ${selected === index ? styles.selected : ""}`}>
            <div className={styles.stage} data-variant={index} data-paused={paused} role="group" aria-label="ZEN: Ideas built to move. Start your growth.">
              <MetalPreview variant={index} replay={replay + individual[index]} paused={paused} settings={settings} inspection={expanded === index ? inspection : null} />
              <div className={styles.stageMeta}><span>{variant.label}</span>{variant.recommended && <span className={styles.recommended}>ОРИЕНТИР</span>}</div>
              {<div key={`${replay}-${individual[index]}`} className={`${styles.composition} ${backgroundOnly ? styles.hiddenComposition : ""}`} style={{ "--entry-duration": `${variant.duration * 0.65}s`, "--entry-delay": `${variant.duration * 0.22}s` } as CSSProperties}>
                <div className={styles.logo}><Image src="/images/zen/hero-poster.webp" alt="ZEN" fill sizes={expanded !== null ? "65vw" : "35vw"} className={styles.logoImage} /></div>
                <p>Ideas built to move<span>.</span></p>
                <span className={styles.previewCta}>Start your growth <ArrowUpRight size={12} /></span>
              </div>}
              <button className={styles.enlarge} aria-label={`Смотреть крупно: ${variant.name}`} onClick={() => { setExpanded(expanded === index ? null : index); restart(); window.scrollTo(0, 0); }}><Maximize2 size={16} /></button>
            </div>
            <div className={styles.details}>
              <div className={styles.titleRow}><h2><span>{variantNumber(index)}</span>{variant.name}</h2><span className={styles.feel}>{variant.feel}</span></div>
              <p className={styles.entryDescription}>{variant.entry}</p>
              <p className={styles.motionDescription}>{variant.motion}</p>
              <ol className={styles.phases}>{variant.phases.map((phase) => <li key={phase}>{phase}</li>)}</ol>
              <dl className={styles.direction}><div><dt>Форма</dt><dd>{variant.shape}</dd></div><div><dt>Блик и тень</dt><dd>{variant.lighting}</dd></div></dl>
              <div className={styles.actions}>
                <button onClick={() => { setInspection(null); setPaused(false); setIndividual((values) => values.map((value, i) => i === index ? value + 1 : value)); }}><RotateCcw size={14} /> Повторить</button>
                <button className={styles.choose} aria-pressed={selected === index} onClick={() => setSelected(index)}>{selected === index ? <><Check size={14} /> Выбран</> : <>Выбрать {variantNumber(index)} <ArrowUpRight size={14} /></>}</button>
              </div>
            </div>
          </article>
        ))}
      </section>
      <footer className={styles.footer}><span>ZEN / MOTION LAB</span><p>Смотри крупно, чтобы оценить блики. Выбор отмечается на этой странице; напиши номер, который нравится.</p></footer>
    </main>
  );
}
